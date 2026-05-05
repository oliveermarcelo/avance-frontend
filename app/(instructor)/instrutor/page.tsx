import Link from "next/link";
import {
  GraduationCap,
  Users,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  PlayCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import { getInstructorDashboard } from "@/lib/data/instructor-dashboard";

function formatPrice(value: number, compact = false): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `ha ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `ha ${days} dias`;
  return date.toLocaleDateString("pt-BR");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function InstructorDashboardPage() {
  const user = await requireInstructor();
  const data = await getInstructorDashboard(user.id);
  const { kpis, topCourses, recentEnrollments } = data;

  const nameParts = user.name.split(" ").filter(Boolean);
  const greetingName =
    nameParts[0] === "Dr." || nameParts[0] === "Dra."
      ? `${nameParts[0]} ${nameParts[1] ?? ""}`.trim()
      : nameParts[0];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 lg:mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
          Visao geral
        </p>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
          Ola, {greetingName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe o desempenho dos seus cursos e dos seus alunos.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E5A8C]/10 text-[#1E5A8C]">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Cursos
            </span>
          </div>
          <p className="mt-3 font-montserrat text-2xl font-bold text-slate-900">
            {kpis.totalCourses}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {kpis.publishedCourses} publicado{kpis.publishedCourses !== 1 && "s"}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Alunos
            </span>
          </div>
          <p className="mt-3 font-montserrat text-2xl font-bold text-slate-900">
            {kpis.totalEnrollments}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {kpis.enrollmentsDelta >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span
              className={
                kpis.enrollmentsDelta >= 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              {kpis.enrollmentsDelta > 0 ? "+" : ""}
              {kpis.enrollmentsDelta}%
            </span>
            <span className="text-slate-400">vs mes anterior</span>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <DollarSign className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Receita Total
            </span>
          </div>
          <p className="mt-3 font-montserrat text-2xl font-bold text-slate-900">
            {formatPrice(kpis.revenueAllTime, true)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Este mes: {formatPrice(kpis.revenueThisMonth, true)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Star className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Avaliacao
            </span>
          </div>
          <p className="mt-3 font-montserrat text-2xl font-bold text-slate-900">
            {kpis.averageRating > 0 ? kpis.averageRating.toFixed(1) : "-"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {kpis.totalReviews} avaliacoes recebidas
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <header className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
                Top performance
              </p>
              <h2 className="mt-1 font-montserrat text-lg font-bold text-[#1F3A2D]">
                Seus cursos
              </h2>
            </div>
            <Link
              href="/instrutor/cursos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E5A8C] hover:underline"
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </Link>
          </header>

          {topCourses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                Voce ainda nao tem cursos
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Entre em contato com o admin para criar seu primeiro curso.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {topCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/instrutor/cursos/${course.id}`}
                    className="group flex items-center gap-4 rounded-lg border border-slate-200 p-3 transition hover:border-[#1E5A8C] hover:bg-[#1E5A8C]/5"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#1F3A2D] to-[#234433]">
                      {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <PlayCircle className="h-5 w-5 text-white/40" />
                        </div>
                      )}
                      {!course.isPublished && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] font-bold text-white uppercase tracking-wider">
                          Rascunho
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-[#1E5A8C]">
                        {course.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-0.5">
                          <Users className="h-3 w-3" />
                          {course.enrollmentCount} alunos
                        </span>
                        {course.averageRating > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {course.averageRating.toFixed(1)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5">
                          <PlayCircle className="h-3 w-3" />
                          {course.totalLessons} aulas
                        </span>
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Preco
                      </p>
                      <p className="font-bold text-slate-900">
                        {formatPrice(course.price, true)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1E5A8C]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <header className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
              Atividade
            </p>
            <h2 className="mt-1 font-montserrat text-lg font-bold text-[#1F3A2D]">
              Matriculas recentes
            </h2>
          </header>

          {recentEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Sem matriculas ainda
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Quando alguem se matricular nos seus cursos, aparece aqui.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentEnrollments.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                >
                  {e.userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.userAvatar}
                      alt={e.userName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E5A8C] text-[10px] font-bold text-white">
                      {getInitials(e.userName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {e.userName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Matriculou em <span className="font-medium">{e.courseTitle}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatRelativeDate(e.enrolledAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";