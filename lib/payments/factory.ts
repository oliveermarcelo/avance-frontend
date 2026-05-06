import "server-only";
import { getPaymentSettings } from "@/lib/settings";
import { mockAdapter } from "./mock-adapter";
import { createAsaasAdapter } from "./asaas-adapter";
import type { PaymentGateway } from "./types";

const notImplementedAdapter = (name: string): PaymentGateway => ({
  name,
  async createCheckout() {
    return {
      ok: false,
      status: "FAILED",
      errorMessage: `Gateway ${name} ainda nao implementado.`,
    };
  },
  async getPaymentStatus() {
    return { status: "FAILED" };
  },
});

export async function getPaymentGateway(): Promise<PaymentGateway | null> {
  const settings = await getPaymentSettings();

  if (settings.gateway === "NONE") return null;
  if (settings.gateway === "MOCK") return mockAdapter;

  if (settings.gateway === "ASAAS") {
    if (!settings.asaasApiKey) return null;
    return createAsaasAdapter({
      apiKey: settings.asaasApiKey,
      sandbox: settings.asaasSandbox ?? true,
      webhookToken: settings.asaasWebhookToken,
    });
  }

  if (settings.gateway === "MERCADO_PAGO") {
    return notImplementedAdapter("MERCADO_PAGO");
  }

  return null;
}