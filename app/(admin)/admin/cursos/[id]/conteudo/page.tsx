import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { CourseContentManager } from "@/components/admin/course-content-manager";

async function getCourseWithContent(id: string) {
  return db.course.findUnique({
    where: { id, deletedAt: null },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              videoUrl: true,
              duration: true,
              order: true,
              isFree: true,
            },
          },
        },
      },
    },
  });
}

export default async function ConteudoCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseWithContent(id);

  if (!course) notFound();

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0),
    0
  );

  const modulesForClient = course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl,
      duration: l.duration,
      order: l.order,
      isFree: l.isFree,
    })),
  }));

  return (
    <div className="px-8 py-8">
      <header className="mb-6 space-y-3">
        <Link
          href={`/admin/cursos/${course.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para edicao do curso
        </Link>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Conteudo do curso
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {course.modules.length}{" "}
              {course.modules.length === 1 ? "modulo" : "modulos"} ·{" "}
              {totalLessons} {totalLessons === 1 ? "aula" : "aulas"} ·{" "}
              {Math.round(totalDuration / 60)} min totais
            </p>
          </div>

          {course.isPublished && (
            <Link
              href={`/curso/${course.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-slate-600 transition hover:text-slate-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver na plataforma
            </Link>
          )}
        </div>
      </header>

      <CourseContentManager
        courseId={course.id}
        modules={modulesForClient}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";