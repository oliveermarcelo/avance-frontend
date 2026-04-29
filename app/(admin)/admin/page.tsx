import Link from "next/link";
import {
  DollarSign,
  Users,
  BookOpen,
  PlayCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/admin/kpi-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  TopCoursesList,
  RecentCoursesList,
  RecentReviewsList,
} from "@/components/admin/dashboard-lists";
import {
  getDashboardKpis,
  getRevenueByDay,
  getTopCourses,
  getRecentCourses,
  getRecentReviews,
} from "@/lib/data/admin-dashboard";
import { requireAdmin } from "@/lib/auth/admin";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [kpis, revenueData, topCourses, recentCourses, recentReviews] = await Promise.all([
    getDashboardKpis(),
    getRevenueByDay(30),
    getTopCourses(5),
    getRecentCourses(5),
    getRecentReviews(5),
  ]);

  const firstName = admin.name.split(" ")[0];

  return (
    <div className="px-8 py-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Painel de gestao
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Bem-vindo de volta, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Visao geral da plataforma e atalhos rapidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/usuarios">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/cursos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo curso
            </Link>
          </Button>
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita do mes"
          value={formatCurrency(kpis.revenueThisMonth)}
          delta={kpis.revenueDelta}
          deltaLabel="vs mes anterior"
          icon={DollarSign}
          tint="emerald"
        />
        <KpiCard
          label="Alunos ativos"
          value={kpis.totalActiveStudents.toString()}
          delta={kpis.enrollmentsDelta}
          deltaLabel="novas matriculas (7d)"
          icon={Users}
          tint="blue"
        />
        <KpiCard
          label="Cursos publicados"
          value={kpis.publishedCourses.toString()}
          icon={BookOpen}
          tint="violet"
        />
        <KpiCard
          label="Aulas vistas hoje"
          value={kpis.lessonsWatchedToday.toString()}
          delta={kpis.lessonsWatchedDelta}
          deltaLabel="vs ontem"
          icon={PlayCircle}
          tint="amber"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <RevenueChart data={revenueData} />

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Receita acumulada
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(kpis.totalRevenue)}
                </p>
              </div>
              <Link
                href="/admin/pagamentos"
                className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Ver pagamentos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <p className="text-xs text-slate-500">
              Total recebido em todos os pagamentos com status pago desde o inicio da plataforma.
            </p>
          </article>

          <TopCoursesList courses={topCourses} />
        </div>

        <aside className="space-y-6">
          <RecentCoursesList courses={recentCourses} />
          <RecentReviewsList reviews={recentReviews} />

          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Atalhos
            </p>
            <div className="space-y-2">
              <Link
                href="/admin/cursos"
                className="block rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Gerenciar cursos
              </Link>
              <Link
                href="/admin/categorias"
                className="block rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Editar categorias
              </Link>
              <Link
                href="/admin/usuarios"
                className="block rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Gerenciar usuarios
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";