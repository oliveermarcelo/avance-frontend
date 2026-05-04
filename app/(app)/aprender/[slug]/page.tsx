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
  INTERMEDIATE: "Intermedi�rio",
  ADVANCED: "Avan�ado",
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

      <div className="px-8 py-8 grid gap-8 lg:grid-cols-[1fr_360px] max-w-7xl">
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 aspect-video flex items-center justify-center">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/5" />

            <div className="relative z-10 flex flex-col items-center gap-3 text-primary-foreground/85">
              <PlayCircle className="h-16 w-16 text-accent" strokeWidth={1.5} />
              <p className="text-sm">Trailer do curso</p>
            </div>

            {course.isPremium && (
              <span className="absolute right-4 top-4 rounded-md bg-accent px-3 py-1 text-[10px] font-bold tracking-wider text-accent-foreground">
                PREMIUM
              </span>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <PlayCircle className="h-4 w-4" />
                {course.totalLessons} aulas
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDuration(course.totalDuration)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                {course.enrollmentCount} alunos
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Award className="h-4 w-4" />
                {levelLabels[course.level]}
              </span>
              {course.averageRating > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
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
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {course.description}
              </p>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-primary">Conte�do do curso</h3>
              <p className="text-sm text-muted-foreground">
                Veja o que voc� vai aprender
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
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              {course.instructor.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  {getUserInitials(course.instructor.name)}
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <div>
                  <h4 className="font-bold text-primary">{course.instructor.name}</h4>
                  {course.instructor.crm && (
                    <p className="text-xs text-muted-foreground">
                      {course.instructor.crm}
                    </p>
                  )}
                </div>
                {course.instructor.bio && (
                  <p className="text-sm text-foreground/80 leading-relaxed pt-2">
                    {course.instructor.bio}
                  </p>
                )}
              </div>
            </div>
          </section>

          {course.reviews.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-base font-bold text-primary">
                Avalia��es ({course._count.reviews})
              </h3>
              <div className="space-y-3">
                {course.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-5 space-y-2"
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
                      <p className="text-sm text-foreground/85 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                {course.isFree ? "Curso gratuito" : "Investimento"}
              </p>
              <p className="text-3xl font-bold text-primary">
                {course.isFree ? "Gr�tis" : formatPrice(course.price)}
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
                    {enrollment.progress > 0 ? "Continuar curso" : "Come�ar curso"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form action={enrollAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <Button type="submit" className="w-full" size="lg">
                  {course.isFree ? "Matricular-se gr�tis" : "Matricular-se agora"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            )}

            <ul className="space-y-2 pt-4 border-t border-border text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-accent" />
                Conte�do focado em medicina
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Acesso vital�cio
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-accent" />
                Certificado de conclus�o
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";