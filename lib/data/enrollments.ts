import "server-only";
import { db } from "@/lib/db";

export async function getUserEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: { lastAccessAt: "desc" },
    include: {
      course: {
        include: {
          category: { select: { name: true, slug: true, color: true } },
          instructor: { select: { name: true, avatar: true } },
        },
      },
    },
  });
}

export async function getContinueWatching(userId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      progress: { gt: 0, lt: 100 },
    },
    orderBy: { lastAccessAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      lessonProgress: {
        orderBy: { watchedAt: "desc" },
        take: 1,
        include: { lesson: { include: { module: true } } },
      },
    },
  });

  if (!enrollment) return null;

  const lastWatched = enrollment.lessonProgress[0]?.lesson;

  return {
    enrollmentId: enrollment.id,
    course: enrollment.course,
    progress: enrollment.progress,
    currentModule: lastWatched?.module?.title ?? enrollment.course.modules[0]?.title,
  };
}