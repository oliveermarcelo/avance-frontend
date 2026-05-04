import Link from "next/link";
import { ArrowRight, Clock, Users, PlayCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  isPremium: boolean;
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  category: { name: string; color: string | null } | null;
  instructor: { name: string };
}

interface FeaturedCoursesProps {
  courses: FeaturedCourse[];
}

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
  return `${hours}h de conteudo`;
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <section id="cursos-destaque" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
              Em destaque
            </p>
            <h2 className="mt-2 font-montserrat text-3xl font-bold text-[#1F3A2D] sm:text-4xl">
              Cursos selecionados pelos especialistas
            </h2>
            <p className="mt-3 text-slate-600">
              Conteudo de alto nivel com instrutores reconhecidos no mercado.
              Comece sua jornada de evolucao profissional agora.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-[#1F3A2D]/20 text-[#1F3A2D] hover:bg-[#1F3A2D] hover:text-white"
          >
            <Link href="/cursos-publicos">
              Ver todos os cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/curso/${course.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-[#1F3A2D]/30 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                  </div>
                )}

                {course.isPremium && (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#C9A227] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1F3A2D]">
                    Premium
                  </div>
                )}

                {course.category && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur px-2 py-0.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: course.category.color ?? "#1F3A2D",
                      }}
                    />
                    <span className="text-[10px] font-semibold text-slate-700">
                      {course.category.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-montserrat text-base font-bold text-[#1F3A2D] line-clamp-2 group-hover:text-[#163024]">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {course.shortDescription}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Com <span className="font-medium text-slate-700">{course.instructor.name}</span>
                </p>

                <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-500 border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.totalLessons} aulas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(course.totalDuration)}
                  </span>
                  {course.enrollmentCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrollmentCount}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                  {course.isFree ? (
                    <p className="font-montserrat text-lg font-bold text-emerald-600">
                      Gratis
                    </p>
                  ) : (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Investimento
                      </p>
                      <p className="font-montserrat text-xl font-bold text-[#1F3A2D]">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  )}
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1F3A2D]/5 text-[#1F3A2D] transition-all group-hover:bg-[#1F3A2D] group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}