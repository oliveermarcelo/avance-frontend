import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Users,
  PlayCircle,
  Clock,
  Award,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Header } from "@/components/avance/header";
import { Button } from "@/components/ui/button";
import { CourseOutline } from "@/components/avance/course-outline";
import { getCourseBySlug, getEnrollment } from "@/lib/data/course";
import { getCurrentUser, getUserInitials } from "@/lib/data/user";
import { enrollAction } from "./actions";

function formatPrice(value: { toNumber(): number } | number): string {
  const num = typeof value === "object" ? value.toNumber() : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const levelLabels = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediario",
  ADVANCED: "Avancado",
};

export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await getCourseBySlug(slug);
  if (!course || !course.isPublished) notFound();

  const user = await getCurrentUser();
  const enrollment = user ? await getEnrollment(user.id, course.id) : null;
  const isEnrolled = !!enrollment;

  const watchedLessons = new Set(
    enrollment?.lessonProgress.filter((p) => p.watched).map((p) => p.lessonId) ?? []
  );

  return (
    <>
      <Header
        subtitle={course.category?.name ?? "Curso"}
        title={course.title}
      />

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 mx-auto w-full max-w-7xl grid gap-6 lg:gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 sm:space-y-8 min-w-0">
          <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 aspect-video flex items-center justify-center">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent/5 sm:-left-20 sm:-bottom-20 sm:h-64 sm:w-64" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-primary-foreground/85 sm:gap-3">
              <PlayCircle className="h-12 w-12 text-accent sm:h-16 sm:w-16" strokeWidth={1.5} />
              <p className="text-xs sm:text-sm">Trailer do curso</p>
            </div>
            {course.isPremium && (
              <span className="absolute right-3 top-3 rounded-md bg-accent px-2.5 py-1 text-[9px] font-bold tracking-wider text-accent-foreground sm:right-4 sm:top-4 sm:px-3 sm:text-[10px]">
                PREMIUM
              </span>
            )}
          </section>

          <div className="lg:hidden rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                {course.isFree ? "Curso gratuito" : "Investimento"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {course.isFree ? "Gratis" : formatPrice(course.price)}
              </p>
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Seu progresso</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(enrollment.progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href={`/aprender/${course.slug}/aula/${course.modules[0]?.lessons[0]?.id ?? ""}`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {enrollment.progress > 0 ? "Continuar curso" : "Comecar curso"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form action={enrollAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <Button type="submit" className="w-full" size="lg">
                  {course.isFree ? "Matricular-se Gratis" : "Matricular-se agora"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:gap-x-6 sm:gap-y-3 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {course.totalLessons} aulas
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {formatDuration(course.totalDuration)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {course.enrollmentCount} alunos
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {levelLabels[course.level]}
              </span>
              {course.averageRating > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent sm:h-4 sm:w-4" />
                  <span className="font-semibold text-foreground">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({course._count.reviews})
                  </span>
                </span>
              )}
            </div>

            {course.description && (
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line sm:text-base">
                {course.description}
              </p>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-primary">Conteudo do curso</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Veja o que voce vai aprender
              </p>
            </div>
            <CourseOutline
              modules={course.modules}
              isEnrolled={isEnrolled}
              watchedLessons={watchedLessons}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-bold text-primary">Sobre o instrutor</h3>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
              {course.instructor.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold sm:h-14 sm:w-14">
                  {getUserInitials(course.instructor.name)}
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <div>
                  <h4 className="font-bold text-primary text-sm sm:text-base">
                    {course.instructor.name}
                  </h4>
                  {course.instructor.crm && (
                    <p className="text-xs text-muted-foreground">
                      {course.instructor.crm}
                    </p>
                  )}
                </div>
                {course.instructor.bio && (
                  <p className="text-xs text-foreground/80 leading-relaxed pt-2 sm:text-sm">
                    {course.instructor.bio}
                  </p>
                )}
              </div>
            </div>
          </section>

          {course.reviews.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-base font-bold text-primary">
                Avaliacoes ({course._count.reviews})
              </h3>
              <div className="space-y-3">
                {course.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-2 sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      {review.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                          {getUserInitials(review.user.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary">
                          {review.user.name}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < review.rating
                                  ? "h-3 w-3 fill-accent text-accent"
                                  : "h-3 w-3 text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-foreground/85 leading-relaxed sm:text-sm">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                {course.isFree ? "Curso gratuito" : "Investimento"}
              </p>
              <p className="text-3xl font-bold text-primary">
                {course.isFree ? "Gratis" : formatPrice(course.price)}
              </p>
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Seu progresso</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(enrollment.progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href={`/aprender/${course.slug}/aula/${course.modules[0]?.lessons[0]?.id ?? ""}`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {enrollment.progress > 0 ? "Continuar curso" : "Comecar curso"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form action={enrollAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <Button type="submit" className="w-full" size="lg">
                  {course.isFree ? "Matricular-se Gratis" : "Matricular-se agora"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            )}

            <ul className="space-y-2 pt-4 border-t border-border text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-accent" />
                Conteudo focado em medicina
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Acesso vitalicio
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-accent" />
                Certificado de Conclusao
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";