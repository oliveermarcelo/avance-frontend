import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Eye,
  Users,
  Star,
  PlayCircle,
  Clock,
  DollarSign,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import {
  getInstructorCourseDetail,
  getInstructorCourseStudents,
  getInstructorCourseReviews,
} from "@/lib/data/instructor-course-detail";

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

const levelLabels: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediario",
  ADVANCED: "Avancado",
};

function formatPrice(value: number, compact = false): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Tab = "overview" | "students" | "reviews";

const tabs: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "Visao geral" },
  { key: "students", label: "Alunos" },
  { key: "reviews", label: "Avaliacoes" },
];

export default async function InstructorCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const user = await requireInstructor();
  const { id } = await params;
  const sp = await searchParams;

  const tab: Tab =
    sp.tab === "students" || sp.tab === "reviews" ? sp.tab : "overview";
  const page = Math.max(1, Number(sp.page ?? 1));

  const course = await getInstructorCourseDetail(id, user.id);
  if (!course) notFound();

  const students =
    tab === "students"
      ? await getInstructorCourseStudents(id, user.id, page)
      : null;

  const reviews =
    tab === "reviews" ? await getInstructorCourseReviews(id, user.id) : [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/instrutor/cursos"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1E5A8C]"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para meus cursos
      </Link>

      <header className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {course.isPublished ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Publicado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <CircleDashed className="h-3 w-3" />
                Rascunho
              </span>
            )}
            {course.isPremium && (
              <span className="rounded-md bg-[#1E5A8C] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Premium
              </span>
            )}
            {course.category && (
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {course.category.name}
              </span>
            )}
          </div>
          <h1 className="font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
            {course.title}
          </h1>
          {course.shortDescription && (
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              {course.shortDescription}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start">
          <Link
            href={`/curso/${course.slug}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#1E5A8C] hover:text-[#1E5A8C]"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver pagina publica
          </Link>
          <Link
            href={`/instrutor/cursos/${course.id}/editar`}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1E5A8C] px-3 text-xs font-semibold text-white transition hover:bg-[#164767]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar curso
          </Link>
        </div>
      </header>

      <section className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Alunos
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {course.enrollmentCount}
          </p>
          <p className="text-[10px] text-slate-500">
            {course.completedCount} concluiram
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <DollarSign className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Receita
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {formatPrice(course.revenue, true)}
          </p>
          <p className="text-[10px] text-slate-500">
            Preco {formatPrice(course.price, true)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 text-violet-700">
              <Star className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Avaliacao
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {course.averageRating > 0 ? course.averageRating.toFixed(1) : "-"}
          </p>
          <p className="text-[10px] text-slate-500">
            {course.reviewsCount} avaliacoes
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1E5A8C]/10 text-[#1E5A8C]">
              <PlayCircle className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Conteudo
            </span>
          </div>
          <p className="mt-2 font-montserrat text-xl font-bold text-slate-900">
            {course.totalLessons} aulas
          </p>
          <p className="text-[10px] text-slate-500">
            {formatDuration(course.totalDuration)}
          </p>
        </article>
      </section>

      <div className="mt-8 border-b border-slate-200">
        <nav className="flex items-center gap-1 -mb-px">
          {tabs.map((t) => {
            const isActive = tab === t.key;
            const href =
              t.key === "overview"
                ? `/instrutor/cursos/${course.id}`
                : `/instrutor/cursos/${course.id}?tab=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold transition border-b-2 ${
                  isActive
                    ? "border-[#1E5A8C] text-[#1E5A8C]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-6">
            {course.description && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Descricao
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Conteudo do curso
              </h3>
              {course.modules.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nenhum modulo cadastrado.
                </p>
              ) : (
                <ul className="space-y-3">
                  {course.modules.map((module, idx) => (
                    <li
                      key={module.id}
                      className="rounded-lg border border-slate-200 overflow-hidden"
                    >
                      <header className="flex items-center gap-3 bg-slate-50 px-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1F3A2D] text-[10px] font-bold text-white">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {module.title}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {module.lessons.length} aulas
                          </p>
                        </div>
                      </header>
                      {module.lessons.length > 0 && (
                        <ul>
                          {module.lessons.map((lesson, lIdx) => (
                            <li
                              key={lesson.id}
                              className="flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-xs"
                            >
                              <span className="text-[10px] text-slate-400 w-6 font-bold">
                                {String(lIdx + 1).padStart(2, "0")}
                              </span>
                              <PlayCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="flex-1 truncate text-slate-700">
                                {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                  PREVIEW
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {formatDuration(lesson.duration)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {tab === "students" && students && (
          <div>
            {students.enrollments.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-900">
                  Nenhum aluno matriculado
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Quando alguem se matricular, aparece aqui.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Mostrando{" "}
                    <span className="font-bold text-slate-700">
                      {(students.currentPage - 1) * 20 + 1}-
                      {Math.min(
                        students.currentPage * 20,
                        students.total
                      )}
                    </span>{" "}
                    de <span className="font-bold text-slate-700">{students.total}</span>{" "}
                    alunos
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Aluno
                        </th>
                        <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:table-cell">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Progresso
                        </th>
                        <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">
                          Matriculou
                        </th>
                        <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:table-cell">
                          Ultimo acesso
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.enrollments.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {e.user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={e.user.avatar}
                                  alt={e.user.name}
                                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E5A8C] text-[10px] font-bold text-white">
                                  {getInitials(e.user.name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {e.user.name}
                                </p>
                                <p className="truncate text-[10px] text-slate-500">
                                  {e.user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[e.status]}`}
                            >
                              {STATUS_LABELS[e.status] ?? e.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-slate-200 lg:w-24">
                                <div
                                  className="h-full rounded-full bg-[#1E5A8C]"
                                  style={{ width: `${e.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-700">
                                {Math.round(e.progress)}%
                              </span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                            {formatDate(e.enrolledAt)}
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                            {formatDate(e.lastAccessAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {students.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Pagina {students.currentPage} de {students.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      {students.currentPage > 1 && (
                        <Link
                          href={`/instrutor/cursos/${course.id}?tab=students&page=${students.currentPage - 1}`}
                          className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#1E5A8C] hover:text-[#1E5A8C]"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          Anterior
                        </Link>
                      )}
                      {students.currentPage < students.totalPages && (
                        <Link
                          href={`/instrutor/cursos/${course.id}?tab=students&page=${students.currentPage + 1}`}
                          className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#1E5A8C] hover:text-[#1E5A8C]"
                        >
                          Proxima
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {reviews.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Star className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-900">
                  Nenhuma avaliacao ainda
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Quando os alunos avaliarem o curso, aparecem aqui.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {r.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.user.avatar}
                          alt={r.user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E5A8C] text-xs font-bold text-white">
                          {getInitials(r.user.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {r.user.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={
                                  i < r.rating
                                    ? "h-3 w-3 fill-amber-500 text-amber-500"
                                    : "h-3 w-3 text-slate-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(r.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm leading-relaxed text-slate-700">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";