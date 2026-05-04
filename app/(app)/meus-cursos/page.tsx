import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Header } from "@/components/avance/header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data/user";
import { getUserEnrollments } from "@/lib/data/enrollments";

export default async function MeusCursosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await getUserEnrollments(user.id);

  return (
    <>
      <Header
        subtitle="Sua jornada"
        title="Meus cursos"
      />

      <div className="px-8 py-8">
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
              Você ainda não está matriculado em nenhum curso
            </h3>
            <p className="text-muted-foreground">
              Explore nosso catálogo e comece sua jornada.
            </p>
            <Button asChild>
              <Link href="/cursos">Explorar cursos</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";