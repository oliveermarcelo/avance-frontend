import { CourseForm } from "@/components/admin/course-form";
import { getInstructorsAndCategories } from "@/lib/data/admin-options";

export default async function NovoCursoPage() {
  const { instructors, categories } = await getInstructorsAndCategories();

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Novo curso
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Criar novo curso</h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha as informacoes basicas. Voce pode adicionar modulos e aulas depois.
        </p>
      </header>

      <CourseForm
        mode="create"
        instructors={instructors}
        categories={categories}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";