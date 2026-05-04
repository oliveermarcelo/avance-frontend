import { db } from "@/lib/db";
import { CatalogClient } from "@/components/public/catalog-client";

async function getCatalogData() {
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
      },
      orderBy: [{ isFeatured: "desc" }, { enrollmentCount: "desc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true, color: true } },
        instructor: { select: { name: true } },
      },
    }),
    db.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, color: true },
      where: {
        courses: {
          some: { isPublished: true, deletedAt: null },
        },
      },
    }),
  ]);

  const coursesForClient = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    thumbnail: c.thumbnail,
    price: c.price.toNumber(),
    isFree: c.isFree,
    isPremium: c.isPremium,
    level: c.level,
    totalLessons: c.totalLessons,
    totalDuration: c.totalDuration,
    enrollmentCount: c.enrollmentCount,
    category: c.category,
    instructor: c.instructor,
  }));

  return { courses: coursesForClient, categories };
}

export default async function CursosPublicosPage() {
  const { courses, categories } = await getCatalogData();

  return (
    <div className="bg-white pt-16">
      <section className="border-b border-slate-200 bg-slate-50 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
            Catalogo
          </p>
          <h1 className="mt-2 font-montserrat text-3xl font-bold text-[#1F3A2D] sm:text-4xl lg:text-5xl">
            Todos os cursos
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Conteudo selecionado por especialistas para profissionais da saude
            que buscam excelencia. Use os filtros para encontrar o curso ideal.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <CatalogClient courses={courses} categories={categories} />
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";