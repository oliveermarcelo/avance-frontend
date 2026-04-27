import Link from "next/link";
import { ChevronRight, PlayCircle } from "lucide-react";
import { Header } from "@/components/avance/header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data/user";
import { getUserEnrollments, getContinueWatching } from "@/lib/data/enrollments";

function formatPrice(value: number | bigint | { toNumber(): number }): string {
  const num = typeof value === "object" ? value.toNumber() : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const firstReal = parts.find((p) => !/^(dr|dra|sr|sra|prof)\.?$/i.test(p));
  return firstReal ?? parts[0];
}

export default async function InicioPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [enrollments, continueWatching] = await Promise.all([
    getUserEnrollments(user.id),
    getContinueWatching(user.id),
  ]);

  return (
    <>
      <Header
        subtitle={`Olá, ${getFirstName(user.name)}`}
        title={enrollments.length > 0 ? "Continue de onde parou" : "Bem-vindo à plataforma"}
      />

      <div className="px-8 py-8 space-y-8">
        {continueWatching && (
          <section className="relative overflow-hidden rounded-2xl bg-primary p-6 md:p-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/10" />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/5" />

            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  Em andamento
                </p>
                <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                  {continueWatching.course.title}
                </h2>
                {continueWatching.currentModule && (
                  <p className="text-sm text-primary-foreground/70">
                    {continueWatching.currentModule}
                  </p>
                )}
                <div className="flex items-center gap-3 max-w-md">
                  <div className="h-1.5 flex-1 rounded-full bg-primary-foreground/15">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${continueWatching.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary-foreground">
                    {Math.round(continueWatching.progress)}%
                  </span>
                </div>
              </div>

              <Button size="lg" className="shrink-0" asChild>
                <Link href={`/curso/${continueWatching.course.slug}`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continuar curso
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {enrollments.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-base font-bold text-primary">Meus cursos</h3>
                <p className="text-sm text-muted-foreground">Acompanhe seu progresso</p>
              </div>
              <Button variant="ghost" size="sm" className="text-accent" asChild>
                <Link href="/meus-cursos">
                  Ver todos <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.slice(0, 6).map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/curso/${enrollment.course.slug}`}
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
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
            <h3 className="text-xl font-bold text-primary">
              Você ainda não está matriculado em nenhum curso
            </h3>
            <p className="text-muted-foreground">
              Explore nosso catálogo e comece sua jornada de aprendizado.
            </p>
            <Button asChild>
              <Link href="/cursos">Explorar cursos</Link>
            </Button>
          </section>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";