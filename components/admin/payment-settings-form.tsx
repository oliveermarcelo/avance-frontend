"use client";

import { useState, useTransition } from "react";
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Plug,
  Sparkles,
  Beaker,
  Power,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  savePaymentSettingsAction,
  testGatewayConnectionAction,
  type SavePaymentState,
  type TestConnectionState,
} from "@/app/(admin)/admin/configuracoes/pagamento/actions";
import type { PaymentSettings, PaymentGatewayType } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface PaymentSettingsFormProps {
  initialSettings: PaymentSettings;
}

const gatewayOptions: Array<{
  value: PaymentGatewayType;
  label: string;
  description: string;
  icon: typeof Power;
  badge?: string;
}> = [
  {
    value: "NONE",
    label: "Nenhum",
    description: "Pagamentos desativados. Apenas cursos gratuitos podem ser oferecidos.",
    icon: Power,
  },
  {
    value: "MOCK",
    label: "Mock (Testes)",
    description: "Gateway fake para testar o fluxo de checkout sem cobrar de verdade.",
    icon: Beaker,
    badge: "Dev",
  },
  {
    value: "ASAAS",
    label: "Asaas",
    description: "PIX, boleto e cartao com taxas competitivas para o Brasil.",
    icon: Sparkles,
  },
  {
    value: "MERCADO_PAGO",
    label: "Mercado Pago",
    description: "Plataforma robusta com varios metodos de pagamento.",
    icon: Sparkles,
  },
];

export function PaymentSettingsForm({ initialSettings }: PaymentSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTesting] = useTransition();
  const [state, setState] = useState<SavePaymentState | undefined>();
  const [testResult, setTestResult] = useState<TestConnectionState | undefined>();

  const [gateway, setGateway] = useState<PaymentGatewayType>(initialSettings.gateway);
  const [asaasApiKey, setAsaasApiKey] = useState(initialSettings.asaasApiKey ?? "");
  const [asaasSandbox, setAsaasSandbox] = useState(initialSettings.asaasSandbox ?? true);
  const [asaasWebhookToken, setAsaasWebhookToken] = useState(initialSettings.asaasWebhookToken ?? "");
  const [mpAccessToken, setMpAccessToken] = useState(initialSettings.mercadoPagoAccessToken ?? "");
  const [mpPublicKey, setMpPublicKey] = useState(initialSettings.mercadoPagoPublicKey ?? "");
  const [mpSandbox, setMpSandbox] = useState(initialSettings.mercadoPagoSandbox ?? true);

  const [showAsaasKey, setShowAsaasKey] = useState(false);
  const [showAsaasWebhook, setShowAsaasWebhook] = useState(false);
  const [showMpToken, setShowMpToken] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    setTestResult(undefined);
    startTransition(async () => {
      const result = await savePaymentSettingsAction(undefined, formData);
      setState(result);
    });
  };

  const handleTest = () => {
    setTestResult(undefined);
    startTesting(async () => {
      const result = await testGatewayConnectionAction();
      setTestResult(result);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {state?.message && state.ok && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <p className="text-sm text-emerald-700">{state.message}</p>
        </div>
      )}

      {state?.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold">Verifique os campos:</p>
            <ul className="mt-1 list-disc pl-4 text-xs">
              {Object.entries(state.fieldErrors).map(([field, errs]) => (
                <li key={field}>{errs?.[0]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <header>
          <h2 className="text-sm font-bold text-slate-900">Gateway ativo</h2>
          <p className="text-xs text-slate-500">
            Escolha qual gateway processara os pagamentos da plataforma.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {gatewayOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = gateway === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-all",
                  isSelected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <input
                  type="radio"
                  name="gateway"
                  value={opt.value}
                  checked={isSelected}
                  onChange={(e) => setGateway(e.target.value as PaymentGatewayType)}
                  className="sr-only"
                  disabled={isPending}
                />
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                  {opt.badge && (
                    <span className="ml-auto inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>

                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
                    <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </section>

      {gateway === "ASAAS" && (
        <section className="space-y-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
          <header>
            <h2 className="text-sm font-bold text-slate-900">Configuracao do Asaas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pegue suas credenciais no painel do Asaas em Configuracoes &rarr; Integracoes.
            </p>
          </header>

          <div className="space-y-2">
            <Label htmlFor="asaasApiKey">API Key</Label>
            <div className="relative">
              <Input
                id="asaasApiKey"
                name="asaasApiKey"
                type={showAsaasKey ? "text" : "password"}
                value={asaasApiKey}
                onChange={(e) => setAsaasApiKey(e.target.value)}
                placeholder="$aact_YTU5YTE0M2M2N..."
                disabled={isPending}
                className="pr-10 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => setShowAsaasKey(!showAsaasKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showAsaasKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asaasWebhookToken">Webhook Token (opcional)</Label>
            <div className="relative">
              <Input
                id="asaasWebhookToken"
                name="asaasWebhookToken"
                type={showAsaasWebhook ? "text" : "password"}
                value={asaasWebhookToken}
                onChange={(e) => setAsaasWebhookToken(e.target.value)}
                placeholder="Token configurado em Integracoes > Webhooks no Asaas"
                disabled={isPending}
                className="pr-10 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => setShowAsaasWebhook(!showAsaasWebhook)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showAsaasWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              URL do webhook: /api/webhooks/asaas. Cole esse token no campo "Token de autenticacao" ao criar o webhook no painel do Asaas.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="asaasSandbox"
              checked={asaasSandbox}
              onChange={(e) => setAsaasSandbox(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            <span className="text-xs text-slate-700">
              <span className="font-semibold">Modo Sandbox</span> (use para testar antes de ir
              para producao)
            </span>
          </label>
        </section>
      )}

      {gateway === "MERCADO_PAGO" && (
        <section className="space-y-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
          <header>
            <h2 className="text-sm font-bold text-slate-900">Configuracao do Mercado Pago</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pegue suas credenciais em developers.mercadopago.com.br &rarr; Suas integracoes.
            </p>
          </header>

          <div className="space-y-2">
            <Label htmlFor="mercadoPagoAccessToken">Access Token</Label>
            <div className="relative">
              <Input
                id="mercadoPagoAccessToken"
                name="mercadoPagoAccessToken"
                type={showMpToken ? "text" : "password"}
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                placeholder="APP_USR-..."
                disabled={isPending}
                className="pr-10 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => setShowMpToken(!showMpToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showMpToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mercadoPagoPublicKey">Public Key</Label>
            <Input
              id="mercadoPagoPublicKey"
              name="mercadoPagoPublicKey"
              value={mpPublicKey}
              onChange={(e) => setMpPublicKey(e.target.value)}
              placeholder="APP_USR-..."
              disabled={isPending}
              className="font-mono text-xs bg-white"
            />
            <p className="text-[10px] text-slate-500">
              Public Key e usada no frontend para tokenizar cartoes (e seguro expor).
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="mercadoPagoSandbox"
              checked={mpSandbox}
              onChange={(e) => setMpSandbox(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            <span className="text-xs text-slate-700">
              <span className="font-semibold">Modo Sandbox</span> (use para testar antes de ir
              para producao)
            </span>
          </label>
        </section>
      )}

      {testResult && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3",
            testResult.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          )}
        >
          {testResult.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          )}
          <p
            className={cn(
              "text-sm",
              testResult.ok ? "text-emerald-700" : "text-red-700"
            )}
          >
            {testResult.message}
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleTest}
          disabled={isPending || isTesting || gateway === "NONE"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Plug className="h-4 w-4" />
              Testar conexao
            </>
          )}
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar configuracoes
            </>
          )}
        </button>
      </div>
    </form>
  );
}