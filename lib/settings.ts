import "server-only";
import { db } from "@/lib/db";

export type PaymentGatewayType = "NONE" | "MOCK" | "ASAAS" | "MERCADO_PAGO";

export interface PaymentSettings {
  gateway: PaymentGatewayType;
  asaasApiKey?: string;
  asaasSandbox?: boolean;
  mercadoPagoAccessToken?: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoSandbox?: boolean;
}

const PAYMENT_KEY = "payment.config";

export async function getSetting<T = string>(key: string): Promise<T | null> {
  const setting = await db.settings.findUnique({ where: { key } });
  if (!setting) return null;
  try {
    return JSON.parse(setting.value) as T;
  } catch {
    return setting.value as unknown as T;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const stringified = typeof value === "string" ? value : JSON.stringify(value);
  await db.settings.upsert({
    where: { key },
    create: { key, value: stringified },
    update: { value: stringified },
  });
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete({ where: { key } }).catch(() => {});
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  gateway: "NONE",
  asaasSandbox: true,
  mercadoPagoSandbox: true,
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const stored = await getSetting<PaymentSettings>(PAYMENT_KEY);
  if (!stored) return DEFAULT_PAYMENT_SETTINGS;
  return {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...stored,
  };
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  await setSetting(PAYMENT_KEY, settings);
}

export async function getActiveGateway(): Promise<PaymentGatewayType> {
  const settings = await getPaymentSettings();
  return settings.gateway;
}