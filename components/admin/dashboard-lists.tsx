import Link from "next/link";
import { Trophy, Calendar, Star, MessageSquare, ChevronRight } from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays} dias atras`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem atras`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

interface TopCourse {
  id: string;
  title: string;
  slug: string;
  category: { name: string; color: string | null } | null;
  salesCount: number;
  revenue: number;
}

interface TopCoursesListProps {
  courses: TopCourse[];
}

export function TopCoursesList({ courses }: TopCoursesListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Mais vendidos do mes
        </h3>
      </header>

      {courses.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Nenhuma venda este mes ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {courses.map((course, idx) => (
            <li key={course.id}>
              <Link
                href={`/admin/cursos/${course.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-slate-50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                  {idx + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    {course.category && (
                      <>
                        <span
                          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: course.category.color ?? "#1F3A2D",
                          }}
                        />
                        <span>{course.category.name}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>
                      {course.salesCount} {course.salesCount === 1 ? "venda" : "vendas"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    {formatCurrency(course.revenue)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface RecentCourse {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  enrollmentCount: number;
  category: { name: string; color: string | null } | null;
}

interface RecentCoursesListProps {
  courses: RecentCourse[];
}

export function RecentCoursesList({ courses }: RecentCoursesListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Publicados recentemente
        </h3>
      </header>

      {courses.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Nenhum curso publicado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/admin/cursos/${course.id}`}
                className="block rounded-md px-2 py-2 transition hover:bg-slate-50"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {course.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                  {course.category && (
                    <>
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: course.category.color ?? "#1F3A2D",
                        }}
                      />
                      <span>{course.category.name}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatRelativeDate(course.publishedAt)}</span>
                  <span>·</span>
                  <span>
                    {course.enrollmentCount}{" "}
                    {course.enrollmentCount === 1 ? "aluno" : "alunos"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
  courseTitle: string;
  courseSlug: string;
}

interface RecentReviewsListProps {
  reviews: Review[];
}

export function RecentReviewsList({ reviews }: RecentReviewsListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Avaliacoes recentes
          </h3>
        </div>
        {reviews.length > 0 && (
          <Link
            href="/admin/avaliacoes"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900"
          >
            Ver todas
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </header>

      {reviews.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Sem avaliacoes ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-md bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                {review.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-white">
                    {review.userName.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {review.userName}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < review.rating
                              ? "h-3 w-3 fill-amber-400 text-amber-400"
                              : "h-3 w-3 text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="truncate text-[10px] text-slate-500">
                    {review.courseTitle}
                  </p>
                  {review.comment && (
                    <p className="mt-1.5 text-xs text-slate-700 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}