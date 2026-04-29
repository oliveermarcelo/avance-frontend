import { BookOpen, Users, GraduationCap, CreditCard } from "lucide-react";
import { db } from "@/lib/db";

async function getStats() {
  const [users, courses, enrollments, payments] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.course.count({ where: { deletedAt: null } }),
    db.enrollment.count({ where: { status: { in: ["ACTIVE", "COMPLETED"] } } }),
    db.payment.count({ where: { status: "PAID" } }),
  ]);

  return { users, courses, enrollments, payments };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Usuarios ativos",
      value: stats.users,
      icon: Users,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Cursos cadastrados",
      value: stats.courses,
      icon: BookOpen,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Matriculas ativas",
      value: stats.enrollments,
      icon: GraduationCap,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pagamentos pagos",
      value: stats.payments,
      icon: CreditCard,
      tint: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="px-8 py-8">
      <header className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Painel de gestao
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visao geral da plataforma. Use o menu lateral para gerenciar conteudo, usuarios e vendas.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${card.tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          KPIs, graficos e atalhos rapidos serao adicionados em breve.
          <br />
          Por enquanto, navegue no menu para gerenciar a plataforma.
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";