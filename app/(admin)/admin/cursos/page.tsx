import Link from "next/link";
import {
  Plus,
  PlayCircle,
  Users,
  Eye,
  EyeOff,
  Pencil,
  Star,
  Trash2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminCourses } from "@/lib/data/admin-courses";
import {
  togglePublishAction,
  toggleFeaturedAction,
  deleteCourseAction,
} from "./actions";

function formatPrice(value: { toNumber(): number } | number): string {
  const num = typeof value === "object" ? value.toNumber() : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();

  return (
    <div className="px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Conteudo
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {courses.length} {courses.length === 1 ? "curso cadastrado" : "cursos cadastrados"}
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/cursos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo curso
          </Link>
        </Button>
      </header>

      {courses.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Curso
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Categoria
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Conteudo
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Alunos
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Preco
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {courses.map((course) => (
                <tr key={course.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-900 to-slate-700">
                        <PlayCircle className="h-4 w-4 text-white/80" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {course.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {course.instructor.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-600">
                      {course.category?.name ?? "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {course._count.modules}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" />
                        {course.totalLessons}
                      </span>
                      <span>{formatDuration(course.totalDuration)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {course.isFree ? "Gratis" : formatPrice(course.price)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={
                          course.isPublished
                            ? "inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"
                            : "inline-flex w-fit items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                        }
                      >
                        {course.isPublished ? "Publicado" : "Rascunho"}
                      </span>
                      {course.isFeatured && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                          Destaque
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <form action={toggleFeaturedAction}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <button
                          type="submit"
                          className={
                            course.isFeatured
                              ? "flex h-8 w-8 items-center justify-center rounded-md text-amber-600 transition hover:bg-amber-50"
                              : "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-amber-600"
                          }
                          title={course.isFeatured ? "Remover destaque" : "Destacar"}
                        >
                          <Star
                            className={course.isFeatured ? "h-4 w-4 fill-current" : "h-4 w-4"}
                          />
                        </button>
                      </form>

                      <form action={togglePublishAction}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <button
                          type="submit"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title={course.isPublished ? "Despublicar" : "Publicar"}
                        >
                          {course.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </form>

                      <Link
                        href={`/admin/cursos/${course.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <form action={deleteCourseAction}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <button
                          type="submit"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <PlayCircle className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Nenhum curso cadastrado</h3>
          <p className="mt-1 text-sm text-slate-500">
            Comece criando seu primeiro curso.
          </p>
          <Button asChild className="mt-5">
            <Link href="/admin/cursos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro curso
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";