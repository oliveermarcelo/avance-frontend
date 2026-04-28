import "server-only";
import { db } from "@/lib/db";

export async function getLessonContext(slug: string, lessonId: string, userId: string) {
  const course = await db.course.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
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
              videoUrl: true,
              description: true,
              resources: true,
              moduleId: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const flatLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleOrder: m.order }))
  );

  const lessonIndex = flatLessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return null;

  const lesson = flatLessons[lessonIndex];
  const previousLesson = lessonIndex > 0 ? flatLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < flatLessons.length - 1 ? flatLessons[lessonIndex + 1] : null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    include: {
      lessonProgress: {
        select: { lessonId: true, watched: true, watchedSeconds: true },
      },
    },
  });

  const notes = await db.lessonNote.findMany({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
  });

  const currentProgress = enrollment?.lessonProgress.find(
    (p) => p.lessonId === lessonId
  );

  return {
    course,
    lesson,
    previousLesson,
    nextLesson,
    enrollment,
    notes,
    initialSeconds: currentProgress?.watchedSeconds ?? 0,
    isWatched: currentProgress?.watched ?? false,
    watchedLessonIds: new Set(
      enrollment?.lessonProgress.filter((p) => p.watched).map((p) => p.lessonId) ?? []
    ),
  };
}