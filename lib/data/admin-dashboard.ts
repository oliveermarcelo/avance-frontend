import "server-only";
import { db } from "@/lib/db";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return startOfDay(d);
}

function calcDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardKpis() {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = daysAgo(1);

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const sevenDaysAgo = daysAgo(7);
  const fourteenDaysAgo = daysAgo(14);

  const [
    totalRevenuePaid,
    revenueThisMonth,
    revenueLastMonth,
    enrollmentsThisWeek,
    enrollmentsLastWeek,
    publishedCourses,
    lessonsWatchedToday,
    lessonsWatchedYesterday,
    totalActiveStudents,
  ] = await Promise.all([
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: startOfThisMonth },
      },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    db.enrollment.count({
      where: {
        status: { in: ["ACTIVE", "COMPLETED"] },
        enrolledAt: { gte: sevenDaysAgo },
      },
    }),
    db.enrollment.count({
      where: {
        status: { in: ["ACTIVE", "COMPLETED"] },
        enrolledAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    }),
    db.course.count({
      where: { isPublished: true, deletedAt: null },
    }),
    db.lessonProgress.count({
      where: {
        watched: true,
        watchedAt: { gte: today, lte: endOfDay(now) },
      },
    }),
    db.lessonProgress.count({
      where: {
        watched: true,
        watchedAt: { gte: yesterday, lt: today },
      },
    }),
    db.user.count({
      where: {
        role: "STUDENT",
        isActive: true,
        enrollments: {
          some: { status: { in: ["ACTIVE", "COMPLETED"] } },
        },
      },
    }),
  ]);

  const revThis = Number(revenueThisMonth._sum.amount ?? 0);
  const revLast = Number(revenueLastMonth._sum.amount ?? 0);

  return {
    totalRevenue: Number(totalRevenuePaid._sum.amount ?? 0),
    revenueThisMonth: revThis,
    revenueDelta: calcDelta(revThis, revLast),
    enrollmentsThisWeek,
    enrollmentsDelta: calcDelta(enrollmentsThisWeek, enrollmentsLastWeek),
    publishedCourses,
    lessonsWatchedToday,
    lessonsWatchedDelta: calcDelta(lessonsWatchedToday, lessonsWatchedYesterday),
    totalActiveStudents,
  };
}

export async function getRevenueByDay(days: number = 30) {
  const startDate = daysAgo(days - 1);

  const payments = await db.payment.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: startDate },
    },
    select: { amount: true, paidAt: true },
  });

  const buckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = daysAgo(days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = startOfDay(p.paidAt).toISOString().slice(0, 10);
    if (buckets[key] !== undefined) {
      buckets[key] += Number(p.amount);
    }
  }

  return Object.entries(buckets).map(([date, amount]) => ({
    date,
    amount,
  }));
}

export async function getTopCourses(limit: number = 5) {
  const startOfThisMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const sales = await db.payment.groupBy({
    by: ["courseId"],
    where: {
      status: "PAID",
      paidAt: { gte: startOfThisMonth },
    },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  if (sales.length === 0) return [];

  const courseIds = sales.map((s) => s.courseId);
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      category: { select: { name: true, color: true } },
    },
  });

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return sales
    .map((s) => {
      const course = courseMap.get(s.courseId);
      if (!course) return null;
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        category: course.category,
        salesCount: s._count.id,
        revenue: Number(s._sum.amount ?? 0),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function getRecentCourses(limit: number = 5) {
  const courses = await db.course.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      enrollmentCount: true,
      category: { select: { name: true, color: true } },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    enrollmentCount: c.enrollmentCount,
    category: c.category,
  }));
}

export async function getRecentReviews(limit: number = 5) {
  const reviews = await db.courseReview.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, avatar: true } },
      course: { select: { title: true, slug: true } },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name,
    userAvatar: r.user.avatar,
    courseTitle: r.course.title,
    courseSlug: r.course.slug,
  }));
}