import Link from "next/link";
import { PlayCircle, Star } from "lucide-react";
import { Header } from "@/components/avance/header";
import { getPublishedCourses } from "@/lib/data/courses";

function formatPrice(value: { toNumber(): number } | number): string {
  const num = typeof value === "object" ? value.toNumber() : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDuration(minutes: number): string {
  const total = Math.round(minutes / 60);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const min = total % 60;
  return min > 0 ? `${hours}h ${min}min` : `${hours}h`;
}

export default async function CursosPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <Header subtitle="Catalogo" title="Todos os cursos" />

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/aprender/${course.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="relative aspect-video bg-gradient-to-br from-primary to-primary/70">
                  {course.isPremium && (
                    <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[9px] font-bold tracking-wider text-accent-foreground">
                      PREMIUM
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] font-medium text-primary-foreground/85">
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {course.totalLessons} aulas
                    </span>
                    {course.totalDuration > 0 && (
                      <span>{formatDuration(course.totalDuration)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {course.category && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                      {course.category.name}
                    </p>
                  )}
                  <h4 className="font-bold leading-snug text-primary line-clamp-2 min-h-[2.6em]">
                    {course.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.4em]">
                    {course.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      {course.averageRating > 0 ? (
                        <>
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs font-semibold text-foreground">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Sem Avaliacoes
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {course.isFree ? "Gratis" : formatPrice(course.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center">
            <h3 className="text-xl font-bold text-primary mb-2">
              Nenhum curso dispoNivel
            </h3>
            <p className="text-muted-foreground">
              Em breve teremos novos cursos. Volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";