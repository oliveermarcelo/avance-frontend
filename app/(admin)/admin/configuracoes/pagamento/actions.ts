"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getPaymentSettings,
  savePaymentSettings,
  type PaymentGatewayType,
  type PaymentSettings,
} from "@/lib/settings";
import { getGatewayByType } from "@/lib/payments/factory";

const settingsSchema = z.object({
  gateway: z.enum(["NONE", "MOCK", "ASAAS", "MERCADO_PAGO"]),
  asaasApiKey: z.string().max(500).optional().nullable(),
  asaasSandbox: z.boolean(),
  mercadoPagoAccessToken: z.string().max(500).optional().nullable(),
  mercadoPagoPublicKey: z.string().max(500).optional().nullable(),
  mercadoPagoSandbox: z.boolean(),
});

export type SavePaymentState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function savePaymentSettingsAction(
  prevState: SavePaymentState | undefined,
  formData: FormData
): Promise<SavePaymentState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    gateway: formData.get("gateway") as PaymentGatewayType,
    asaasApiKey: String(formData.get("asaasApiKey") ?? "").trim() || null,
    asaasSandbox: formData.get("asaasSandbox") === "on",
    mercadoPagoAccessToken: String(formData.get("mercadoPagoAccessToken") ?? "").trim() || null,
    mercadoPagoPublicKey: String(formData.get("mercadoPagoPublicKey") ?? "").trim() || null,
    mercadoPagoSandbox: formData.get("mercadoPagoSandbox") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (data.gateway === "ASAAS" && !data.asaasApiKey) {
    return {
      fieldErrors: { asaasApiKey: ["Necessario para ativar Asaas"] },
    };
  }

  if (data.gateway === "MERCADO_PAGO" && (!data.mercadoPagoAccessToken || !data.mercadoPagoPublicKey)) {
    return {
      fieldErrors: {
        mercadoPagoAccessToken: !data.mercadoPagoAccessToken
          ? ["Access Token e obrigatorio"]
          : undefined,
        mercadoPagoPublicKey: !data.mercadoPagoPublicKey
          ? ["Public Key e obrigatoria"]
          : undefined,
      } as Record<string, string[]>,
    };
  }

  const settings: PaymentSettings = {
    gateway: data.gateway,
    asaasApiKey: data.asaasApiKey ?? undefined,
    asaasSandbox: data.asaasSandbox,
    mercadoPagoAccessToken: data.mercadoPagoAccessToken ?? undefined,
    mercadoPagoPublicKey: data.mercadoPagoPublicKey ?? undefined,
    mercadoPagoSandbox: data.mercadoPagoSandbox,
  };

  await savePaymentSettings(settings);

  revalidatePath("/admin/configuracoes/pagamento");

  return { ok: true, message: "Configuracoes salvas com sucesso" };
}

export type TestConnectionState = {
  ok?: boolean;
  message?: string;
};

export async function testGatewayConnectionAction(): Promise<TestConnectionState> {
  await requireAdmin();

  const settings = await getPaymentSettings();

  if (settings.gateway === "NONE") {
    return { ok: false, message: "Nenhum gateway selecionado" };
  }

  if (settings.gateway === "MOCK") {
    return {
      ok: true,
      message: "Mock gateway funcionando (sempre disponivel para testes)",
    };
  }

  const gateway = getGatewayByType(settings.gateway);

  try {
    const result = await gateway.createCheckout({
      paymentId: "test_" + Date.now(),
      courseId: "test",
      courseTitle: "Teste de Conexao",
      amountInCents: 100,
      method: "PIX",
      customer: {
        name: "Teste",
        email: "teste@avance.com.br",
        cpf: "00000000000",
      },
    });

    if (result.ok) {
      return { ok: true, message: `Conexao com ${settings.gateway} funcionando` };
    }

    return {
      ok: false,
      message: result.errorMessage || `Falha ao testar ${settings.gateway}`,
    };
  } catch (e) {
    const error = e as Error;
    return {
      ok: false,
      message: `Erro: ${error.message}`,
    };
  }
}