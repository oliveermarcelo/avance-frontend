import "server-only";
import { db } from "@/lib/db";

export interface InstructorStudentsFilter {
  search?: string;
  courseId?: string;
  page?: number;
}

export async function getInstructorStudents(
  instructorId: string,
  filter: InstructorStudentsFilter = {},
  pageSize: number = 20
) {
  const { search, courseId, page = 1 } = filter;
  const skip = (page - 1) * pageSize;

  const courseFilter: any = { instructorId, deletedAt: null };
  if (courseId) courseFilter.id = courseId;

  const courses = await db.course.findMany({
    where: courseFilter,
    select: { id: true, title: true },
  });
  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return {
      students: [],
      total: 0,
      totalPages: 1,
      currentPage: page,
      filterCourses: [],
    };
  }

  const enrollmentWhere: any = { courseId: { in: courseIds } };
  if (search && search.trim()) {
    enrollmentWhere.user = {
      OR: [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
      ],
    };
  }

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where: enrollmentWhere,
      orderBy: { enrolledAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        progress: true,
        status: true,
        enrolledAt: true,
        lastAccessAt: true,
        user: {
          select: { id: true, name: true, email: true, avatar: true, crm: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
    db.enrollment.count({ where: enrollmentWhere }),
  ]);

  const allCoursesForFilter = await db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return {
    students: enrollments.map((e) => ({
      enrollmentId: e.id,
      progress: e.progress,
      status: e.status,
      enrolledAt: e.enrolledAt.toISOString(),
      lastAccessAt: e.lastAccessAt?.toISOString() ?? null,
      user: e.user,
      course: e.course,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
    filterCourses: allCoursesForFilter,
  };
}

export async function getInstructorStudentDetail(
  instructorId: string,
  userId: string
) {
  const enrollments = await db.enrollment.findMany({
    where: {
      userId,
      course: { instructorId, deletedAt: null },
    },
    orderBy: { enrolledAt: "desc" },
    select: {
      id: true,
      status: true,
      progress: true,
      enrolledAt: true,
      completedAt: true,
      lastAccessAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          totalLessons: true,
        },
      },
    },
  });

  if (enrollments.length === 0) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      crm: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const totalSpent = await db.payment.aggregate({
    where: {
      userId,
      status: "PAID",
      course: { instructorId },
    },
    _sum: { amount: true },
  });

  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;
  const avgProgress =
    enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      crm: user.crm,
      avatar: user.avatar,
      memberSince: user.createdAt.toISOString(),
    },
    enrollments: enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      lastAccessAt: e.lastAccessAt?.toISOString() ?? null,
      course: e.course,
    })),
    stats: {
      totalCourses: enrollments.length,
      completedCount,
      avgProgress: Math.round(avgProgress),
      totalSpent: totalSpent._sum.amount?.toNumber() ?? 0,
    },
  };
}