import "server-only";
import type {
  PaymentGateway,
  CheckoutInput,
  CheckoutResult,
  PaymentStatusResult,
  PaymentStatus,
  WebhookEvent,
} from "./types";

interface AsaasConfig {
  apiKey: string;
  sandbox: boolean;
  webhookToken?: string;
}

interface AsaasCustomer {
  id: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  identificationField?: string;
  confirmedDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
}

interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface AsaasErrorBody {
  errors?: Array<{ code?: string; description?: string }>;
}

const STATUS_MAP: Record<string, PaymentStatus> = {
  PENDING: "PENDING",
  AWAITING_RISK_ANALYSIS: "PROCESSING",
  RECEIVED: "PAID",
  CONFIRMED: "PAID",
  RECEIVED_IN_CASH: "PAID",
  OVERDUE: "FAILED",
  REFUNDED: "REFUNDED",
  REFUND_REQUESTED: "REFUNDED",
  REFUND_IN_PROGRESS: "REFUNDED",
  CHARGEBACK_REQUESTED: "FAILED",
  CHARGEBACK_DISPUTE: "FAILED",
  AWAITING_CHARGEBACK_REVERSAL: "FAILED",
  DUNNING_REQUESTED: "PROCESSING",
  DUNNING_RECEIVED: "PAID",
  DELETED: "CANCELLED",
};

function mapStatus(asaasStatus: string): PaymentStatus {
  return STATUS_MAP[asaasStatus] ?? "PENDING";
}

function dueDateForMethod(method: "PIX" | "BOLETO" | "CREDIT_CARD"): string {
  const days = method === "BOLETO" ? 3 : 1;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function expandYear(year: string): string {
  if (year.length === 4) return year;
  if (year.length === 2) return `20${year}`;
  return year;
}

export function createAsaasAdapter(config: AsaasConfig): PaymentGateway {
  const baseUrl = config.sandbox
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";

  async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        access_token: config.apiKey,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let detail = `${res.status}`;
      try {
        const errBody = (await res.json()) as AsaasErrorBody;
        const first = errBody.errors?.[0];
        if (first?.description) {
          detail = `${first.description}${first.code ? ` (${first.code})` : ""}`;
        }
      } catch {
        const text = await res.text().catch(() => "");
        if (text) detail = `${detail}: ${text.slice(0, 200)}`;
      }
      throw new Error(`Asaas ${path} -> ${detail}`);
    }

    return (await res.json()) as T;
  }

  async function findOrCreateCustomer(input: CheckoutInput): Promise<string> {
    const search = await asaas<{ data: AsaasCustomer[] }>(
      `/customers?cpfCnpj=${encodeURIComponent(input.customer.cpf)}`
    );
    if (search.data && search.data.length > 0) {
      return search.data[0].id;
    }

    const created = await asaas<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.customer.name,
        email: input.customer.email,
        cpfCnpj: input.customer.cpf,
        mobilePhone: input.customer.phone,
        postalCode: input.customer.address?.zipcode,
        addressNumber: input.customer.address?.number,
        externalReference: input.customer.email,
      }),
    });

    return created.id;
  }

  return {
    name: "ASAAS",

    async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
      try {
        const customerId = await findOrCreateCustomer(input);

        const billingType = input.method;
        const value = input.amountInCents / 100;
        const dueDate = dueDateForMethod(input.method);

        const payload: Record<string, unknown> = {
          customer: customerId,
          billingType,
          value,
          dueDate,
          externalReference: input.paymentId,
          description: input.courseTitle,
        };

        if (input.method === "CREDIT_CARD") {
          if (!input.card) {
            return {
              ok: false,
              status: "FAILED",
              errorMessage: "Dados do cartao ausentes",
            };
          }
          if (!input.customer.address?.zipcode || !input.customer.address?.number) {
            return {
              ok: false,
              status: "FAILED",
              errorMessage: "CEP e numero do endereco sao obrigatorios para cartao",
            };
          }
          if (!input.customer.phone) {
            return {
              ok: false,
              status: "FAILED",
              errorMessage: "Telefone obrigatorio para cartao",
            };
          }

          payload.creditCard = {
            holderName: input.card.holderName,
            number: input.card.number,
            expiryMonth: input.card.expiryMonth.padStart(2, "0"),
            expiryYear: expandYear(input.card.expiryYear),
            ccv: input.card.cvv,
          };
          payload.creditCardHolderInfo = {
            name: input.customer.name,
            email: input.customer.email,
            cpfCnpj: input.customer.cpf,
            postalCode: input.customer.address.zipcode,
            addressNumber: input.customer.address.number,
            addressComplement: input.customer.address.complement ?? null,
            phone: input.customer.phone,
            mobilePhone: input.customer.phone,
          };
          if (input.remoteIp) {
            payload.remoteIp = input.remoteIp;
          }

          if (input.card.installments && input.card.installments > 1) {
            payload.installmentCount = input.card.installments;
            payload.installmentValue =
              Math.round((value / input.card.installments) * 100) / 100;
          }
        }

        const payment = await asaas<AsaasPayment>("/payments", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const status = mapStatus(payment.status);

        if (input.method === "PIX") {
          const qr = await asaas<AsaasPixQrCode>(
            `/payments/${payment.id}/pixQrCode`
          );
          return {
            ok: true,
            transactionId: payment.id,
            status,
            pix: {
              qrCode: qr.payload,
              qrCodeImage: `data:image/png;base64,${qr.encodedImage}`,
              expiresAt: new Date(qr.expirationDate),
            },
          };
        }

        if (input.method === "BOLETO") {
          return {
            ok: true,
            transactionId: payment.id,
            status,
            boleto: {
              barcode: payment.identificationField ?? "",
              pdfUrl: payment.bankSlipUrl ?? "",
              dueDate: new Date(dueDate),
            },
          };
        }

        return {
          ok: true,
          transactionId: payment.id,
          status,
        };
      } catch (e) {
        const error = e as Error;
        return {
          ok: false,
          status: "FAILED",
          errorMessage: error.message,
        };
      }
    },

    async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
      try {
        const payment = await asaas<AsaasPayment>(`/payments/${transactionId}`);
        const status = mapStatus(payment.status);
        if (status === "PAID") {
          const paidAt =
            payment.confirmedDate ||
            payment.paymentDate ||
            payment.clientPaymentDate;
          return {
            status: "PAID",
            paidAt: paidAt ? new Date(paidAt) : new Date(),
          };
        }
        return { status };
      } catch {
        return { status: "PENDING" };
      }
    },

    validateWebhook(headers, body): WebhookEvent | null {
      if (config.webhookToken) {
        const received = headers["asaas-access-token"];
        if (received !== config.webhookToken) return null;
      }

      const event = body as {
        event?: string;
        payment?: AsaasPayment;
      };
      if (!event.payment) return null;

      const status = mapStatus(event.payment.status);
      const paidAt =
        event.payment.confirmedDate ||
        event.payment.paymentDate ||
        event.payment.clientPaymentDate;

      return {
        transactionId: event.payment.id,
        status,
        paidAt: paidAt ? new Date(paidAt) : undefined,
      };
    },
  };
}