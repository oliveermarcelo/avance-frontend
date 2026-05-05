import Link from "next/link";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import { getInstructorStudents } from "@/lib/data/instructor-students";

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function InstructorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; courseId?: string; page?: string }>;
}) {
  const user = await requireInstructor();
  const params = await searchParams;
  const search = params.q ?? "";
  const courseId = params.courseId ?? undefined;
  const page = Math.max(1, Number(params.page ?? 1));

  const data = await getInstructorStudents(user.id, {
    search,
    courseId,
    page,
  });

  const buildHref = (next: { q?: string; courseId?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.courseId) sp.set("courseId", next.courseId);
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    const qs = sp.toString();
    return qs ? `/instrutor/alunos?${qs}` : "/instrutor/alunos";
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 lg:mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
          Comunidade
        </p>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
          Alunos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Todos os alunos matriculados nos seus cursos.
        </p>
      </header>

      <form
        method="get"
        action="/instrutor/alunos"
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Buscar por nome ou e-mail..."
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C]"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            name="courseId"
            defaultValue={courseId ?? ""}
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold text-slate-700 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] sm:w-auto sm:min-w-[220px]"
          >
            <option value="">Todos os cursos</option>
            {data.filterCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-[#1E5A8C] px-4 text-xs font-bold text-white hover:bg-[#164767]"
        >
          Filtrar
        </button>

        {(search || courseId) && (
          <Link
            href="/instrutor/alunos"
            className="h-10 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:border-slate-300"
          >
            Limpar
          </Link>
        )}
      </form>

      {data.students.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-900">
            {search || courseId
              ? "Nenhum aluno encontrado"
              : "Nenhum aluno matriculado ainda"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {search || courseId
              ? "Tente ajustar os filtros acima."
              : "Quando alguem se matricular nos seus cursos, aparecera aqui."}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <p>
              Mostrando{" "}
              <span className="font-bold text-slate-700">
                {(data.currentPage - 1) * 20 + 1}-
                {Math.min(data.currentPage * 20, data.total)}
              </span>{" "}
              de <span className="font-bold text-slate-700">{data.total}</span> matriculas
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
                    Curso
                  </th>
                  <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Progresso
                  </th>
                  <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:table-cell">
                    Ultimo acesso
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr
                    key={s.enrollmentId}
                    className="border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/instrutor/alunos/${s.user.id}`}
                        className="flex items-center gap-3 group"
                      >
                        {s.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.user.avatar}
                            alt={s.user.name}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E5A8C] text-[10px] font-bold text-white">
                            {getInitials(s.user.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900 group-hover:text-[#1E5A8C]">
                            {s.user.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">
                            {s.user.email}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-500 lg:hidden">
                            {s.course.title}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <p className="truncate text-xs text-slate-700 max-w-[260px]">
                        {s.course.title}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[s.status]}`}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-200 lg:w-24">
                          <div
                            className="h-full rounded-full bg-[#1E5A8C]"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          {Math.round(s.progress)}%
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                      {formatDate(s.lastAccessAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Pagina {data.currentPage} de {data.totalPages}
              </p>
              <div className="flex items-center gap-2">
                {data.currentPage > 1 && (
                  <Link
                    href={buildHref({ q: search, courseId, page: data.currentPage - 1 })}
                    className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#1E5A8C] hover:text-[#1E5A8C]"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Anterior
                  </Link>
                )}
                {data.currentPage < data.totalPages && (
                  <Link
                    href={buildHref({ q: search, courseId, page: data.currentPage + 1 })}
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
  );
}

export const dynamic = "force-dynamic";