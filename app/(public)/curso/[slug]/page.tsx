import { notFound } from "next/navigation";
import {
  PlayCircle,
  Users,
  Clock,
  BookOpen,
  Star,
  Award,
  ChevronDown,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { EnrollCard } from "@/components/public/enroll-card";
import { getUserInitials } from "@/lib/data/user";

async function getCourseDetail(slug: string) {
  const course = await db.course.findUnique({
    where: { slug, deletedAt: null, isPublished: true },
    include: {
      category: { select: { id: true, name: true, color: true } },
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          crm: true,
          bio: true,
        },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              isFree: true,
              order: true,
            },
          },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
    },
  });

  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: course.thumbnail,
    trailer: course.trailer,
    level: course.level,
    price: course.price.toNumber(),
    isFree: course.isFree,
    isPremium: course.isPremium,
    totalLessons: course.totalLessons,
    totalDuration: course.totalDuration,
    enrollmentCount: course.enrollmentCount,
    averageRating: course.averageRating,
    category: course.category,
    instructor: course.instructor,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: m.lessons,
    })),
    reviews: course.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name,
      userAvatar: r.user.avatar,
      userInitials: getUserInitials(r.user.name),
    })),
  };
}

async function getEnrollmentStatus(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "NOT_LOGGED_IN" as const, progress: 0 };
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });

  if (!enrollment) return { status: "NOT_ENROLLED" as const, progress: 0 };

  if (enrollment.status === "ACTIVE") {
    return { status: "ENROLLED_ACTIVE" as const, progress: enrollment.progress };
  }
  if (enrollment.status === "COMPLETED") {
    return { status: "ENROLLED_COMPLETED" as const, progress: 100 };
  }
  if (enrollment.status === "EXPIRED") {
    return { status: "EXPIRED" as const, progress: 0 };
  }
  return { status: "NOT_ENROLLED" as const, progress: 0 };
}

const levelLabels = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediario",
  ADVANCED: "Avancado",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}min` : `${h}h`;
}

function formatTotalHours(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  if (hours < 1) return "Menos de 1 hora";
  if (hours === 1) return "1 hora";
  return `${hours} horas`;
}

export default async function CursoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseDetail(slug);

  if (!course) notFound();

  const enrollment = await getEnrollmentStatus(course.id);
  const totalLessonsActual = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="bg-white pt-16">
      <section className="relative isolate overflow-hidden bg-[#1F3A2D] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.15),transparent_50%)]" />
          <div className="absolute right-0 top-32 h-[400px] w-[400px] rounded-full bg-[#C9A227] opacity-[0.08] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {course.isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A227] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1F3A2D]">
                    Premium
                  </span>
                )}
                {course.category && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 backdrop-blur px-2 py-1">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: course.category.color ?? "#C9A227" }}
                    />
                    <span className="text-[10px] font-semibold tracking-wider uppercase">
                      {course.category.name}
                    </span>
                  </span>
                )}
                <span className="inline-flex items-center rounded-md bg-white/10 backdrop-blur px-2 py-1 text-[10px] font-semibold uppercase tracking-wider">
                  {levelLabels[course.level as keyof typeof levelLabels]}
                </span>
              </div>

              <h1 className="font-montserrat text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              <p className="text-lg text-white/80 leading-relaxed">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-white/70">
                <div className="inline-flex items-center gap-2">
                  {course.instructor.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-[#1F3A2D]">
                      {getUserInitials(course.instructor.name)}
                    </div>
                  )}
                  <span>
                    Com{" "}
                    <span className="font-semibold text-white">
                      {course.instructor.name}
                    </span>
                  </span>
                </div>

                {course.averageRating > 0 && (
                  <div className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
                    <span className="font-semibold text-white">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/60">
                      ({course.reviews.length}{" "}
                      {course.reviews.length === 1 ? "avaliacao" : "avaliacoes"})
                    </span>
                  </div>
                )}

                {course.enrollmentCount > 0 && (
                  <div className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount} alunos</span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 pt-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <BookOpen className="h-4 w-4 text-[#C9A227]" />
                  <p className="mt-2 font-montserrat text-xl font-bold">
                    {totalLessonsActual}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">
                    aulas
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <Clock className="h-4 w-4 text-[#C9A227]" />
                  <p className="mt-2 font-montserrat text-xl font-bold">
                    {formatTotalHours(course.totalDuration)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">
                    de conteudo
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <Award className="h-4 w-4 text-[#C9A227]" />
                  <p className="mt-2 font-montserrat text-xl font-bold">Sim</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">
                    certificado
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:row-span-2">
              <EnrollCard
                course={course}
                status={enrollment.status}
                progress={enrollment.progress}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
              Conteudo do curso
            </p>
            <h2 className="mt-2 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
              O que voce vai aprender
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {course.modules.length} modulos · {totalLessonsActual} aulas ·{" "}
              {formatTotalHours(course.totalDuration)} de conteudo
            </p>
          </header>

          <div className="space-y-3">
            {course.modules.map((module, mIdx) => (
              <details
                key={module.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
                open={mIdx === 0}
              >
                <summary className="flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1F3A2D] text-xs font-bold text-white">
                    {String(mIdx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#1F3A2D]">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {module.lessons.length}{" "}
                      {module.lessons.length === 1 ? "aula" : "aulas"} ·{" "}
                      {formatDuration(
                        module.lessons.reduce((s, l) => s + l.duration, 0)
                      )}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>

                <ul className="border-t border-slate-100">
                  {module.lessons.map((lesson, lIdx) => {
                    const canPreview = lesson.isFree;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-b-0"
                      >
                        <span className="text-[10px] font-bold text-slate-400 w-8">
                          {String(lIdx + 1).padStart(2, "0")}
                        </span>
                        {canPreview ? (
                          <PlayCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-slate-700">
                            {lesson.title}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatDuration(lesson.duration)}
                        </span>
                        {canPreview && (
                          <span className="shrink-0 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                            Preview
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {course.description && (
        <section className="bg-slate-50 py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <header className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Descricao completa
              </p>
              <h2 className="mt-2 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
                Sobre este curso
              </h2>
            </header>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
              Quem ensina
            </p>
            <h2 className="mt-2 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
              Sobre o instrutor
            </h2>
          </header>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row">
              {course.instructor.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1F3A2D] text-xl font-bold text-white">
                  {getUserInitials(course.instructor.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-montserrat text-xl font-bold text-[#1F3A2D]">
                  {course.instructor.name}
                </h3>
                {course.instructor.crm && (
                  <p className="mt-0.5 text-xs font-semibold tracking-wider uppercase text-[#C9A227]">
                    {course.instructor.crm}
                  </p>
                )}
                {course.instructor.bio ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {course.instructor.bio}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 italic">
                    Especialista reconhecido com vasta experiencia clinica e
                    academica.
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      {course.reviews.length > 0 && (
        <section className="bg-slate-50 py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <header className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                  Depoimentos
                </p>
                <h2 className="mt-2 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
                  O que dizem os alunos
                </h2>
              </div>
              {course.averageRating > 0 && (
                <div className="text-right">
                  <p className="font-montserrat text-3xl font-bold text-[#1F3A2D]">
                    {course.averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-0.5 justify-end">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.round(course.averageRating)
                            ? "h-3.5 w-3.5 fill-[#C9A227] text-[#C9A227]"
                            : "h-3.5 w-3.5 text-slate-300"
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              {course.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < review.rating
                            ? "h-3.5 w-3.5 fill-[#C9A227] text-[#C9A227]"
                            : "h-3.5 w-3.5 text-slate-300"
                        }
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <blockquote className="text-sm leading-relaxed text-slate-700">
                      &ldquo;{review.comment}&rdquo;
                    </blockquote>
                  )}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                    {review.userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-white">
                        {review.userInitials}
                      </div>
                    )}
                    <p className="text-xs font-semibold text-slate-700">
                      {review.userName}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";