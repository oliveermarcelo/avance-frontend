import "server-only";
import { db } from "@/lib/db";

export type InstructorCourseFilter = "all" | "published" | "draft";

export async function getInstructorCourses(
  instructorId: string,
  filter: InstructorCourseFilter = "all"
) {
  const where: any = {
    instructorId,
    deletedAt: null,
  };

  if (filter === "published") where.isPublished = true;
  if (filter === "draft") where.isPublished = false;

  const courses = await db.course.findMany({
    where,
    orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      thumbnail: true,
      price: true,
      isFree: true,
      isPublished: true,
      isPremium: true,
      level: true,
      totalLessons: true,
      totalDuration: true,
      enrollmentCount: true,
      averageRating: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true, color: true } },
      _count: { select: { reviews: true } },
    },
  });

  const courseIds = courses.map((c) => c.id);

  const revenueByCourse = await db.payment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds }, status: "PAID" },
    _sum: { amount: true },
  });

  const revenueMap = new Map(
    revenueByCourse.map((r) => [r.courseId, r._sum.amount?.toNumber() ?? 0])
  );

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    thumbnail: c.thumbnail,
    price: c.price.toNumber(),
    isFree: c.isFree,
    isPublished: c.isPublished,
    isPremium: c.isPremium,
    level: c.level,
    totalLessons: c.totalLessons,
    totalDuration: c.totalDuration,
    enrollmentCount: c.enrollmentCount,
    averageRating: c.averageRating,
    reviewsCount: c._count.reviews,
    revenue: revenueMap.get(c.id) ?? 0,
    category: c.category,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getInstructorCoursesCounts(instructorId: string) {
  const [all, published, draft] = await Promise.all([
    db.course.count({ where: { instructorId, deletedAt: null } }),
    db.course.count({
      where: { instructorId, deletedAt: null, isPublished: true },
    }),
    db.course.count({
      where: { instructorId, deletedAt: null, isPublished: false },
    }),
  ]);
  return { all, published, draft };
}