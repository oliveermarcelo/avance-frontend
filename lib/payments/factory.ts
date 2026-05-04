import "server-only";
import { getActiveGateway } from "@/lib/settings";
import { mockAdapter } from "./mock-adapter";
import type { PaymentGateway } from "./types";

const notImplementedAdapter = (name: string): PaymentGateway => ({
  name,
  async createCheckout() {
    return {
      ok: false,
      status: "FAILED",
      errorMessage: `Gateway ${name} ainda nao implementado. Use MOCK por enquanto.`,
    };
  },
  async getPaymentStatus() {
    return { status: "FAILED" };
  },
});

export async function getPaymentGateway(): Promise<PaymentGateway | null> {
  const active = await getActiveGateway();

  if (active === "NONE") return null;
  if (active === "MOCK") return mockAdapter;
  if (active === "ASAAS") return notImplementedAdapter("ASAAS");
  if (active === "MERCADO_PAGO") return notImplementedAdapter("MERCADO_PAGO");

  return null;
}

export function getGatewayByType(
  type: "MOCK" | "ASAAS" | "MERCADO_PAGO"
): PaymentGateway {
  if (type === "MOCK") return mockAdapter;
  return notImplementedAdapter(type);
}