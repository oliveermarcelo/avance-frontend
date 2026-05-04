import Link from "next/link";
import {
  PlayCircle,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/avance/header";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/data/user";
import { getUserEnrollments } from "@/lib/data/enrollments";

async function getRecommendedCourses(userId: string, enrolledCourseIds: string[]) {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      isFree: false,
      id: { notIn: enrolledCourseIds },
    },
    orderBy: [
      { isFeatured: "desc" },
      { isPremium: "desc" },
      { enrollmentCount: "desc" },
      { createdAt: "desc" },
    ],
    take: 6,
    include: {
      category: { select: { name: true, color: true } },
      instructor: { select: { name: true } },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    thumbnail: c.thumbnail,
    price: c.price.toNumber(),
    isPremium: c.isPremium,
    level: c.level,
    totalLessons: c.totalLessons,
    totalDuration: c.totalDuration,
    category: c.category,
    instructor: c.instructor,
  }));
}

const levelLabels: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediario",
  ADVANCED: "Avancado",
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  if (hours < 1) {
    const m = Math.round(seconds / 60);
    return `${m}min`;
  }
  return `${hours}h`;
}

export default async function MeusCursosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await getUserEnrollments(user.id);
  const enrolledCourseIds = enrollments.map((e) => e.course.id);
  const recommended = await getRecommendedCourses(user.id, enrolledCourseIds);

  return (
    <>
      <Header subtitle="Sua jornada" title="Meus cursos" />

      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-5">
          {enrollments.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/aprender/${enrollment.course.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-primary to-primary/70">
                    {enrollment.course.isPremium && (
                      <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[9px] font-bold tracking-wider text-accent-foreground">
                        PREMIUM
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[10px] font-medium text-primary-foreground/85">
                      <PlayCircle className="h-3 w-3" />
                      {enrollment.course.totalLessons} aulas
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    {enrollment.course.category && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                        {enrollment.course.category.name}
                      </p>
                    )}
                    <h4 className="font-bold leading-snug text-primary line-clamp-2 min-h-[2.6em]">
                      {enrollment.course.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {Math.round(enrollment.progress)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
              <h3 className="text-xl font-bold text-primary">
                Voce ainda nao esta matriculado em nenhum curso
              </h3>
              <p className="text-muted-foreground">
                Explore o catalogo abaixo e comece sua jornada.
              </p>
            </div>
          )}
        </section>

        {recommended.length > 0 && (
          <section className="mt-16 space-y-6">
            <header className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                  <Sparkles className="h-3 w-3" />
                  Recomendados para voce
                </p>
                <h2 className="mt-1 font-montserrat text-2xl font-bold text-primary">
                  Descubra mais cursos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Continue avancando na sua carreira com cursos selecionados.
                </p>
              </div>
              <Link
                href="/cursos"
                className="hidden items-center gap-1 text-xs font-semibold text-primary hover:text-accent sm:inline-flex"
              >
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </header>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((course) => (
                <Link
                  key={course.id}
                  href={`/curso/${course.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary to-primary/70">
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

                    {course.isPremium && (
                      <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[9px] font-bold tracking-wider text-accent-foreground">
                        PREMIUM
                      </span>
                    )}

                    {course.category && (
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur px-2 py-0.5">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: course.category.color ?? "#1F3A2D" }}
                        />
                        <span className="text-[10px] font-semibold text-slate-700">
                          {course.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-semibold">
                        {levelLabels[course.level] ?? course.level}
                      </span>
                    </div>

                    <h4 className="font-bold leading-snug text-primary line-clamp-2">
                      {course.title}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.shortDescription}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Com{" "}
                      <span className="font-medium text-foreground">
                        {course.instructor.name}
                      </span>
                    </p>

                    <div className="flex items-center gap-3 border-t border-border pt-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.totalLessons} aulas
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(course.totalDuration)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Investimento
                        </p>
                        <p className="font-montserrat text-lg font-bold text-primary">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center sm:hidden">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Ver todos os cursos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";