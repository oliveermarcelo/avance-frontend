import "server-only";
import { db } from "@/lib/db";
import type {
  PaymentGateway,
  CheckoutInput,
  CheckoutResult,
  PaymentStatusResult,
} from "./types";

const AUTO_CONFIRM_AFTER_MS = 300000;

function generateTxId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateMockPixCode(): string {
  return "00020126580014BR.GOV.BCB.PIX0136mock-12345678-1234-1234-1234-1234567890ab5204000053039865802BR5913AVANCE MOCK6009SAO PAULO62290525mockedidentifierxxxxxxxx6304MOCK";
}

function generateMockQrCodeImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#ffffff"/>
    <g fill="#000000">
      ${Array.from({ length: 50 })
        .map(() => {
          const x = Math.floor(Math.random() * 18) * 10 + 10;
          const y = Math.floor(Math.random() * 18) * 10 + 10;
          return `<rect x="${x}" y="${y}" width="10" height="10"/>`;
        })
        .join("")}
      <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" stroke-width="10"/>
      <rect x="140" y="10" width="50" height="50" fill="none" stroke="#000" stroke-width="10"/>
      <rect x="10" y="140" width="50" height="50" fill="none" stroke="#000" stroke-width="10"/>
      <rect x="25" y="25" width="20" height="20"/>
      <rect x="155" y="25" width="20" height="20"/>
      <rect x="25" y="155" width="20" height="20"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const mockAdapter: PaymentGateway = {
  name: "MOCK",

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const transactionId = generateTxId();

    if (input.method === "CREDIT_CARD") {
      return {
        ok: true,
        transactionId,
        status: "PAID",
      };
    }

    if (input.method === "PIX") {
      return {
        ok: true,
        transactionId,
        status: "PENDING",
        pix: {
          qrCode: generateMockPixCode(),
          qrCodeImage: generateMockQrCodeImage(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      };
    }

    if (input.method === "BOLETO") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      return {
        ok: true,
        transactionId,
        status: "PENDING",
        boleto: {
          barcode: "00190.00009 03939.310009 99980.890011 0 99990000049700",
          pdfUrl: `data:text/plain;base64,${Buffer.from("Boleto mockado - apenas para testes").toString("base64")}`,
          dueDate,
        },
      };
    }

    return {
      ok: false,
      status: "FAILED",
      errorMessage: "Metodo de pagamento nao suportado",
    };
  },

  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    const payment = await db.payment.findFirst({
      where: { transactionId },
      select: {
        status: true,
        method: true,
        createdAt: true,
        paidAt: true,
      },
    });

    if (!payment) {
      return { status: "PENDING" };
    }

    if (payment.status === "PAID") {
      return { status: "PAID", paidAt: payment.paidAt ?? new Date() };
    }

    if (payment.status === "FAILED") {
      return { status: "FAILED" };
    }

    if (payment.status === "REFUNDED") {
      return { status: "REFUNDED" };
    }

    if (payment.method === "PIX") {
      const elapsed = Date.now() - payment.createdAt.getTime();
      if (elapsed > AUTO_CONFIRM_AFTER_MS) {
        return { status: "PAID", paidAt: new Date() };
      }
    }

    return { status: "PENDING" };
  },
};