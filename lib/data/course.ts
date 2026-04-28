import "server-only";
import { db } from "@/lib/db";

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug, deletedAt: null },
    include: {
      category: { select: { name: true, slug: true, color: true } },
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          crm: true,
        },
      },
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
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
      _count: {
        select: { reviews: { where: { isPublished: true } } },
      },
    },
  });
}

export async function getEnrollment(userId: string, courseId: string) {
  return db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      lessonProgress: {
        select: { lessonId: true, watched: true },
      },
    },
  });
}