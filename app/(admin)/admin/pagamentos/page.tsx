import { DollarSign, Clock, XCircle, RotateCcw } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserInitials } from "@/lib/data/user";
import { KpiCard } from "@/components/admin/kpi-card";
import { PaymentsTable } from "@/components/admin/payments-table";

async function getPaymentsData() {
  const [payments, aggregates] = await Promise.all([
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    db.payment.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const stats = {
    paidTotal: 0,
    paidCount: 0,
    pendingTotal: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedTotal: 0,
    refundedCount: 0,
  };

  for (const a of aggregates) {
    const sum = Number(a._sum.amount ?? 0);
    if (a.status === "PAID") {
      stats.paidTotal = sum;
      stats.paidCount = a._count.id;
    } else if (a.status === "PENDING") {
      stats.pendingTotal = sum;
      stats.pendingCount = a._count.id;
    } else if (a.status === "FAILED") {
      stats.failedCount = a._count.id;
    } else if (a.status === "REFUNDED") {
      stats.refundedTotal = sum;
      stats.refundedCount = a._count.id;
    }
  }

  const paymentsForTable = payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    status: p.status,
    gateway: p.gateway,
    transactionId: p.transactionId,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    userName: p.user.name,
    userEmail: p.user.email,
    userInitials: getUserInitials(p.user.name),
    userAvatar: p.user.avatar,
    courseTitle: p.course.title,
    courseId: p.course.id,
  }));

  return { payments: paymentsForTable, stats };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const { payments, stats } = await getPaymentsData();

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Comercial
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Pagamentos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historico de transacoes da plataforma. Acoes manuais devem ser usadas apenas
          para pagamentos offline ou casos excepcionais.
        </p>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Recebido (PAID)"
          value={formatCurrency(stats.paidTotal)}
          icon={DollarSign}
          tint="emerald"
        />
        <KpiCard
          label="Pendente"
          value={formatCurrency(stats.pendingTotal)}
          icon={Clock}
          tint="amber"
        />
        <KpiCard
          label="Falhou"
          value={stats.failedCount.toString()}
          icon={XCircle}
          tint="slate"
        />
        <KpiCard
          label="Estornado"
          value={formatCurrency(stats.refundedTotal)}
          icon={RotateCcw}
          tint="slate"
        />
      </section>

      <PaymentsTable payments={payments} />
    </div>
  );
}

export const dynamic = "force-dynamic";