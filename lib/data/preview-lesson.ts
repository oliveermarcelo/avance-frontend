import "server-only";
import { db } from "@/lib/db";

export async function getPreviewLesson(slug: string, lessonId: string) {
  const course = await db.course.findUnique({
    where: { slug, deletedAt: null, isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      thumbnail: true,
      price: true,
      isFree: true,
      totalLessons: true,
      totalDuration: true,
      averageRating: true,
      instructor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              isFree: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      duration: true,
      isFree: true,
      order: true,
      module: {
        select: {
          id: true,
          title: true,
          order: true,
          courseId: true,
        },
      },
    },
  });

  if (!lesson) return null;

  if (lesson.module.courseId !== course.id) return null;

  if (!lesson.isFree) return null;

  return {
    course: {
      ...course,
      price: course.price.toNumber(),
    },
    lesson,
  };
}