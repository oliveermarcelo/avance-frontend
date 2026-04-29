import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/admin/course-form";
import { getAdminCourseById } from "@/lib/data/admin-courses";
import { getInstructorsAndCategories } from "@/lib/data/admin-options";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course, options] = await Promise.all([
    getAdminCourseById(id),
    getInstructorsAndCategories(),
  ]);

  if (!course) notFound();

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const courseForForm = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    categoryId: course.categoryId,
    instructorId: course.instructorId,
    level: course.level,
    price: course.price.toNumber(),
    isFree: course.isFree,
    isPremium: course.isPremium,
    thumbnail: course.thumbnail,
    trailer: course.trailer,
  };

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Editar curso
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {course.modules.length} modulos
          </span>
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            {totalLessons} aulas
          </span>
          {course.isPublished && (
            <Link
              href={`/curso/${course.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver na plataforma
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CourseForm
          mode="edit"
          course={courseForForm}
          instructors={options.instructors}
          categories={options.categories}
        />

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Conteudo
            </p>

            {course.modules.length > 0 ? (
              <div className="space-y-2">
                {course.modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-slate-700">{m.title}</span>
                    </div>
                    <span className="shrink-0 text-slate-500">
                      {m.lessons.length}{" "}
                      {m.lessons.length === 1 ? "aula" : "aulas"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum modulo cadastrado ainda.
              </p>
            )}

            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={`/admin/cursos/${course.id}/conteudo`}>
                Gerenciar modulos e aulas
              </Link>
            </Button>
          </section>

          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-xs text-slate-500">
            <p>
              Apos salvar as informacoes basicas, use a area de gerenciamento
              para adicionar modulos, aulas e materiais de apoio.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";