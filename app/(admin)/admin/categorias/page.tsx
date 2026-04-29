import { CategoriesManager } from "@/components/admin/categories-manager";
import { db } from "@/lib/db";

async function getCategoriesWithCount() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          courses: { where: { deletedAt: null } },
        },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    color: c.color,
    order: c.order,
    courseCount: c._count.courses,
  }));
}

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCount();

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Conteudo
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
        <p className="mt-1 text-sm text-slate-500">
          {categories.length}{" "}
          {categories.length === 1 ? "categoria cadastrada" : "categorias cadastradas"}
        </p>
      </header>

      <div className="max-w-3xl">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";