import { CreditCard } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getPaymentSettings } from "@/lib/settings";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";

export default async function PaymentSettingsPage() {
  await requireAdmin();
  const settings = await getPaymentSettings();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Configuracoes
        </p>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
            <CreditCard className="h-4 w-4" />
          </span>
          Pagamentos
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
          Configure qual gateway processara os pagamentos da plataforma. As alteracoes
          afetam novos checkouts; transacoes em andamento usam a configuracao do momento
          em que foram criadas.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <PaymentSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";