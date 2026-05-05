import "server-only";
import { db } from "@/lib/db";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfPreviousMonth(date: Date): Date {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() - 1);
  return d;
}

function calcDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getInstructorDashboard(instructorId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const previousMonthStart = startOfPreviousMonth(now);

  const courses = await db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      isPublished: true,
      isPremium: true,
      enrollmentCount: true,
      averageRating: true,
      totalLessons: true,
      price: true,
      createdAt: true,
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { enrollmentCount: "desc" },
  });

  const courseIds = courses.map((c) => c.id);
  const publishedCount = courses.filter((c) => c.isPublished).length;

  const enrollmentAggregate = await db.enrollment.aggregate({
    where: { courseId: { in: courseIds } },
    _count: true,
  });
  const totalEnrollments = enrollmentAggregate._count;

  const enrollmentsThisMonth = await db.enrollment.count({
    where: {
      courseId: { in: courseIds },
      enrolledAt: { gte: monthStart },
    },
  });

  const enrollmentsPreviousMonth = await db.enrollment.count({
    where: {
      courseId: { in: courseIds },
      enrolledAt: { gte: previousMonthStart, lt: monthStart },
    },
  });

  const revenueAllTime = await db.payment.aggregate({
    where: {
      courseId: { in: courseIds },
      status: "PAID",
    },
    _sum: { amount: true },
  });

  const revenueThisMonth = await db.payment.aggregate({
    where: {
      courseId: { in: courseIds },
      status: "PAID",
      paidAt: { gte: monthStart },
    },
    _sum: { amount: true },
  });

  const revenuePreviousMonth = await db.payment.aggregate({
    where: {
      courseId: { in: courseIds },
      status: "PAID",
      paidAt: { gte: previousMonthStart, lt: monthStart },
    },
    _sum: { amount: true },
  });

  const totalReviews = courses.reduce((s, c) => s + c._count.reviews, 0);
  const ratingsSum = courses.reduce(
    (s, c) => s + c.averageRating * c._count.reviews,
    0
  );
  const overallAverageRating = totalReviews > 0 ? ratingsSum / totalReviews : 0;

  const recentEnrollments = await db.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { enrolledAt: "desc" },
    take: 6,
    select: {
      id: true,
      enrolledAt: true,
      progress: true,
      user: {
        select: { id: true, name: true, avatar: true },
      },
      course: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return {
    kpis: {
      totalCourses: courses.length,
      publishedCourses: publishedCount,
      totalEnrollments,
      enrollmentsThisMonth,
      enrollmentsDelta: calcDelta(enrollmentsThisMonth, enrollmentsPreviousMonth),
      revenueAllTime: revenueAllTime._sum.amount?.toNumber() ?? 0,
      revenueThisMonth: revenueThisMonth._sum.amount?.toNumber() ?? 0,
      revenueDelta: calcDelta(
        revenueThisMonth._sum.amount?.toNumber() ?? 0,
        revenuePreviousMonth._sum.amount?.toNumber() ?? 0
      ),
      averageRating: Number(overallAverageRating.toFixed(2)),
      totalReviews,
    },
    topCourses: courses.slice(0, 3).map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnail: c.thumbnail,
      isPublished: c.isPublished,
      isPremium: c.isPremium,
      enrollmentCount: c.enrollmentCount,
      averageRating: c.averageRating,
      reviewsCount: c._count.reviews,
      totalLessons: c.totalLessons,
      price: c.price.toNumber(),
    })),
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
      userName: e.user.name,
      userAvatar: e.user.avatar,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
    })),
  };
}