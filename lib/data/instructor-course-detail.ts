import "server-only";
import { db } from "@/lib/db";

export async function getInstructorCourseDetail(
  courseId: string,
  instructorId: string
) {
  const course = await db.course.findFirst({
    where: { id: courseId, instructorId, deletedAt: null },
    include: {
      category: { select: { name: true, color: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              order: true,
              isFree: true,
            },
          },
        },
      },
      _count: { select: { reviews: true, enrollments: true } },
    },
  });

  if (!course) return null;

  const revenueAggregate = await db.payment.aggregate({
    where: { courseId, status: "PAID" },
    _sum: { amount: true },
  });

  const completedCount = await db.enrollment.count({
    where: { courseId, status: "COMPLETED" },
  });

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: course.thumbnail,
    price: course.price.toNumber(),
    isFree: course.isFree,
    isPublished: course.isPublished,
    isPremium: course.isPremium,
    isFeatured: course.isFeatured,
    level: course.level,
    totalLessons: course.totalLessons,
    totalDuration: course.totalDuration,
    enrollmentCount: course.enrollmentCount,
    averageRating: course.averageRating,
    reviewsCount: course._count.reviews,
    completedCount,
    revenue: revenueAggregate._sum.amount?.toNumber() ?? 0,
    category: course.category,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons,
    })),
  };
}

export async function getInstructorCourseStudents(
  courseId: string,
  instructorId: string,
  page: number,
  pageSize: number = 20
) {
  const courseOwnership = await db.course.findFirst({
    where: { id: courseId, instructorId, deletedAt: null },
    select: { id: true },
  });
  if (!courseOwnership) return null;

  const skip = (page - 1) * pageSize;

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        status: true,
        progress: true,
        enrolledAt: true,
        completedAt: true,
        lastAccessAt: true,
        user: {
          select: { id: true, name: true, email: true, avatar: true, crm: true },
        },
      },
    }),
    db.enrollment.count({ where: { courseId } }),
  ]);

  return {
    enrollments: enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      lastAccessAt: e.lastAccessAt?.toISOString() ?? null,
      user: e.user,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
  };
}

export async function getInstructorCourseReviews(
  courseId: string,
  instructorId: string
) {
  const courseOwnership = await db.course.findFirst({
    where: { id: courseId, instructorId, deletedAt: null },
    select: { id: true },
  });
  if (!courseOwnership) return [];

  const reviews = await db.courseReview.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }));
}