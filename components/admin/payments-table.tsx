"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Undo2,
  Loader2,
  X,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  markAsPaidAction,
  refundPaymentAction,
} from "@/app/(admin)/admin/pagamentos/actions";
import { cn } from "@/lib/utils";

type Status = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
type Gateway = "ASAAS" | "MERCADO_PAGO" | "STRIPE" | "MANUAL";

interface PaymentRow {
  id: string;
  amount: number;
  status: Status;
  gateway: Gateway;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  userAvatar: string | null;
  courseTitle: string;
  courseId: string;
}

interface PaymentsTableProps {
  payments: PaymentRow[];
}

const statusLabels: Record<Status, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  FAILED: "Falhou",
  REFUNDED: "Estornado",
};

const statusStyles: Record<Status, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

const gatewayLabels: Record<Gateway, string> = {
  ASAAS: "Asaas",
  MERCADO_PAGO: "Mercado Pago",
  STRIPE: "Stripe",
  MANUAL: "Manual",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [gatewayFilter, setGatewayFilter] = useState<Gateway | "ALL">("ALL");
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (gatewayFilter !== "ALL" && p.gateway !== gatewayFilter) return false;
      if (q) {
        const hay = `${p.userName} ${p.userEmail} ${p.courseTitle} ${p.transactionId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [payments, search, statusFilter, gatewayFilter]);

  const handleMarkAsPaid = (paymentId: string) => {
    if (
      !confirm(
        "Marcar como pago? O aluno sera matriculado automaticamente no curso. Use apenas para pagamentos offline confirmados."
      )
    )
      return;

    setActionMessage(null);
    const fd = new FormData();
    fd.append("paymentId", paymentId);
    startTransition(async () => {
      const result = await markAsPaidAction(fd);
      if (result?.message) {
        setActionMessage({ text: result.message, ok: !!result.ok });
      }
    });
  };

  const handleRefund = (paymentId: string) => {
    if (
      !confirm(
        "Estornar este pagamento? A matricula do aluno sera cancelada e ele perdera acesso ao curso."
      )
    )
      return;

    setActionMessage(null);
    const fd = new FormData();
    fd.append("paymentId", paymentId);
    startTransition(async () => {
      const result = await refundPaymentAction(fd);
      if (result?.message) {
        setActionMessage({ text: result.message, ok: !!result.ok });
      }
    });
  };

  const handleCopyTx = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      setCopiedTx(tx);
      setTimeout(() => setCopiedTx(null), 1500);
    } catch {
      alert("Nao foi possivel copiar");
    }
  };

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4",
            actionMessage.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          )}
        >
          {actionMessage.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          )}
          <div
            className={cn(
              "flex-1 text-sm font-medium",
              actionMessage.ok ? "text-emerald-700" : "text-red-700"
            )}
          >
            {actionMessage.text}
          </div>
          <button onClick={() => setActionMessage(null)}>
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, curso ou ID da transacao..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todos os status</option>
            <option value="PAID">Pagos</option>
            <option value="PENDING">Pendentes</option>
            <option value="FAILED">Falhados</option>
            <option value="REFUNDED">Estornados</option>
          </select>

          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value as Gateway | "ALL")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todos os gateways</option>
            <option value="ASAAS">Asaas</option>
            <option value="MERCADO_PAGO">Mercado Pago</option>
            <option value="STRIPE">Stripe</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} de {payments.length}{" "}
        {payments.length === 1 ? "pagamento" : "pagamentos"}
      </p>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Aluno
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Curso
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Valor
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Gateway
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Data
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.userAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.userAvatar}
                          alt={p.userName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                          {p.userInitials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {p.userName}
                        </p>
                        <p className="truncate text-xs text-slate-500">{p.userEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="truncate text-sm text-slate-700">{p.courseTitle}</p>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-slate-700">
                        {gatewayLabels[p.gateway]}
                      </span>
                      {p.transactionId && (
                        <button
                          onClick={() => handleCopyTx(p.transactionId!)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 transition hover:text-slate-700 truncate max-w-[150px]"
                          title="Copiar ID"
                        >
                          {copiedTx === p.transactionId ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate">{p.transactionId}</span>
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600">
                      {formatDate(p.paidAt ?? p.createdAt)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        statusStyles[p.status]
                      )}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "PENDING" || p.status === "FAILED" ? (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          disabled={isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"
                          title="Marcar como pago (manualmente)"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      ) : null}

                      {p.status === "PAID" ? (
                        <button
                          onClick={() => handleRefund(p.id)}
                          disabled={isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          title="Estornar"
                        >
                          <Undo2 className="h-4 w-4" />
                        </button>
                      ) : null}

                      {(p.status === "REFUNDED") && (
                        <span className="text-[10px] text-slate-400 px-2">Concluido</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            Nenhum pagamento encontrado com esses filtros.
          </p>
        </div>
      )}
    </div>
  );
}