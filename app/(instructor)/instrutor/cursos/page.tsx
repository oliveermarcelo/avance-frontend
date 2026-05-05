import Link from "next/link";
import {
  Users,
  Star,
  PlayCircle,
  Clock,
  ChevronRight,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import {
  getInstructorCourses,
  getInstructorCoursesCounts,
  type InstructorCourseFilter,
} from "@/lib/data/instructor-courses";

const filters: Array<{ key: InstructorCourseFilter; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "draft", label: "Rascunhos" },
];

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
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default async function InstructorCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireInstructor();
  const params = await searchParams;
  const filter: InstructorCourseFilter =
    params.filter === "published" || params.filter === "draft"
      ? params.filter
      : "all";

  const [courses, counts] = await Promise.all([
    getInstructorCourses(user.id, filter),
    getInstructorCoursesCounts(user.id),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 lg:mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
          Catalogo
        </p>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
          Meus cursos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie os cursos que voce leciona na plataforma.
        </p>
      </header>

      <div className="mb-5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start max-w-fit">
        {filters.map((f) => {
          const isActive = filter === f.key;
          const count = counts[f.key];
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/instrutor/cursos" : `/instrutor/cursos?filter=${f.key}`}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#1F3A2D] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {f.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1E5A8C]/10">
            <GraduationCap className="h-5 w-5 text-[#1E5A8C]" />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-900">
            {filter === "draft"
              ? "Nenhum rascunho"
              : filter === "published"
              ? "Nenhum curso publicado ainda"
              : "Voce ainda nao tem cursos"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {filter === "all"
              ? "Entre em contato com o admin para criar seu primeiro curso."
              : "Tente outro filtro acima."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/instrutor/cursos/${course.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#1E5A8C] hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#1F3A2D] to-[#234433]">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PlayCircle className="h-10 w-10 text-white/30" strokeWidth={1.5} />
                  </div>
                )}

                {!course.isPublished && (
                  <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-1 text-[9px] font-bold tracking-wider text-white">
                    RASCUNHO
                  </span>
                )}

                {course.isPublished && course.isPremium && (
                  <span className="absolute left-3 top-3 rounded-md bg-[#1E5A8C] px-2 py-1 text-[9px] font-bold tracking-wider text-white">
                    PREMIUM
                  </span>
                )}

                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-semibold text-white">
                  <PlayCircle className="h-3 w-3" />
                  {course.totalLessons}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4 space-y-3">
                {course.category && (
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: course.category.color ?? "#1E5A8C" }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {course.category.name}
                    </span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      {levelLabels[course.level] ?? course.level}
                    </span>
                  </div>
                )}

                <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1E5A8C]">
                  {course.title}
                </h3>

                {course.shortDescription && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.shortDescription}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                      <Users className="h-3 w-3" />
                      Alunos
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      {course.enrollmentCount}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                      <Star className="h-3 w-3" />
                      Nota
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : "-"}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                      <DollarSign className="h-3 w-3" />
                      Receita
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      {formatPrice(course.revenue, true)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Preco
                    </p>
                    <p className="font-montserrat font-bold text-slate-900">
                      {course.isFree ? "Gratis" : formatPrice(course.price)}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatDuration(course.totalDuration)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1E5A8C]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";