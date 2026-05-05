import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Stethoscope,
  Calendar,
  GraduationCap,
  Award,
  TrendingUp,
  DollarSign,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import { getInstructorStudentDetail } from "@/lib/data/instructor-students";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Em andamento",
  COMPLETED: "Concluido",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  EXPIRED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-50 text-red-700",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const instructor = await requireInstructor();
  const { userId } = await params;

  const data = await getInstructorStudentDetail(instructor.id, userId);
  if (!data) notFound();

  const { user, enrollments, stats } = data;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/instrutor/alunos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1E5A8C]"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para alunos
      </Link>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1E5A8C] text-xl font-bold text-white sm:h-20 sm:w-20">
            {getInitials(user.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
            {user.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phone}
              </span>
            )}
            {user.crm && (
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                CRM {user.crm}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Membro desde {formatDate(user.memberSince)}
            </span>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1E5A8C]/10 text-[#1E5A8C]">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Cursos
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {stats.totalCourses}
          </p>
          <p className="text-[10px] text-slate-500">Matriculas</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <Award className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Concluidos
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {stats.completedCount}
          </p>
          <p className="text-[10px] text-slate-500">Cursos finalizados</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 text-violet-700">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Progresso
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {stats.avgProgress}%
          </p>
          <p className="text-[10px] text-slate-500">Media geral</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <DollarSign className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Investimento
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {formatPrice(stats.totalSpent)}
          </p>
          <p className="text-[10px] text-slate-500">Total gasto</p>
        </article>
      </section>

      <section className="mt-8">
        <header className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
            Hist\u00f3rico
          </p>
          <h2 className="mt-1 font-montserrat text-lg font-bold text-[#1F3A2D]">
            Cursos matriculados
          </h2>
        </header>

        <ul className="space-y-3">
          {enrollments.map((e) => (
            <li key={e.id}>
              <Link
                href={`/instrutor/cursos/${e.course.id}?tab=students`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#1E5A8C] hover:shadow-md"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#1F3A2D] to-[#234433]">
                  {e.course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.course.thumbnail}
                      alt={e.course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-white/40" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${STATUS_COLORS[e.status]}`}
                    >
                      {STATUS_LABELS[e.status] ?? e.status}
                    </span>
                  </div>
                  <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-[#1E5A8C]">
                    {e.course.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 max-w-[200px] rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#1E5A8C]"
                        style={{ width: `${e.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {Math.round(e.progress)}%
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                    <span>Matriculou em {formatDate(e.enrolledAt)}</span>
                    {e.lastAccessAt && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span>Ultimo acesso {formatDate(e.lastAccessAt)}</span>
                      </>
                    )}
                    {e.completedAt && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="text-emerald-600 font-semibold">
                          Concluido em {formatDate(e.completedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#1E5A8C]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";