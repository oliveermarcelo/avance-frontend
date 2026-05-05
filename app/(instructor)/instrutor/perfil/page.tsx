import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Settings as SettingsIcon,
} from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import { db } from "@/lib/db";
import { InstructorCourseEditForm } from "@/components/instructor/instructor-course-edit-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireInstructor();
  const { id } = await params;

  const [course, categories] = await Promise.all([
    db.course.findFirst({
      where: { id, instructorId: user.id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        description: true,
        thumbnail: true,
        level: true,
        categoryId: true,
        price: true,
        isFree: true,
        isPremium: true,
        isFeatured: true,
        isPublished: true,
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!course) notFound();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href={`/instrutor/cursos/${course.id}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1E5A8C]"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para o curso
      </Link>

      <header className="mt-3 mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
          Edicao
        </p>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
          Editar curso
        </h1>
        <p className="mt-1 text-sm text-slate-500 truncate">{course.title}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
          <InstructorCourseEditForm
            course={{
              id: course.id,
              slug: course.slug,
              title: course.title,
              shortDescription: course.shortDescription ?? "",
              description: course.description ?? "",
              thumbnail: course.thumbnail ?? "",
              level: course.level,
              categoryId: course.categoryId,
              price: course.price.toNumber(),
              isFree: course.isFree,
              isPublished: course.isPublished,
            }}
            categories={categories}
          />
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <SettingsIcon className="h-4 w-4 text-[#1E5A8C]" />
              <h3 className="text-xs font-bold text-slate-900">
                Status atual
              </h3>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-slate-600">URL (slug)</span>
                <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                  {course.slug}
                </code>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Tipo</span>
                <span className="font-semibold text-slate-900">
                  {course.isFree ? "Gratuito" : "Pago"}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Premium</span>
                <span
                  className={`font-semibold ${
                    course.isPremium ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {course.isPremium ? "Sim" : "Nao"}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Em destaque</span>
                <span
                  className={`font-semibold ${
                    course.isFeatured ? "text-violet-600" : "text-slate-400"
                  }`}
                >
                  {course.isFeatured ? "Sim" : "Nao"}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700">
                Geridos pelo admin
              </h3>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <li><span className="font-semibold">URL (slug):</span> Alterar quebra links e SEO.</li>
              <li><span className="font-semibold">Tipo (gratuito/pago):</span> Afeta o modelo de negocio.</li>
              <li><span className="font-semibold">Premium / Destaque:</span> Posicionamento no catalogo.</li>
              <li><span className="font-semibold">Estrutura (modulos e aulas):</span> Editor proprio em breve.</li>
            </ul>
            <p className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
              Para alterar qualquer um desses itens, entre em contato com o admin da plataforma.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";