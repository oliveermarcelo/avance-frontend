"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyCourseCompleted } from "@/lib/data/notifications";

const COMPLETION_THRESHOLD = 0.9;

export async function updateProgressAction(input: {
  lessonId: string;
  enrollmentId: string;
  watchedSeconds: number;
  totalSeconds: number;
  slug: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  const userId = session.user.id;
  const { lessonId, enrollmentId, watchedSeconds, totalSeconds, slug } = input;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) return { ok: false };

  const ratio = totalSeconds > 0 ? watchedSeconds / totalSeconds : 0;
  const shouldComplete = ratio >= COMPLETION_THRESHOLD;

  await db.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: { enrollmentId, lessonId },
    },
    create: {
      enrollmentId,
      lessonId,
      userId,
      watchedSeconds: Math.round(watchedSeconds),
      watched: shouldComplete,
      watchedAt: shouldComplete ? new Date() : null,
    },
    update: {
      watchedSeconds: Math.round(watchedSeconds),
      watched: shouldComplete ? true : undefined,
      watchedAt: shouldComplete ? new Date() : undefined,
    },
  });

  if (shouldComplete) {
    await recalcCourseProgress(enrollmentId, lesson.module.courseId, userId);
  }

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { lastAccessAt: new Date() },
  });

  revalidatePath(`/aprender/${slug}`);
  return { ok: true, completed: shouldComplete };
}

export async function markLessonCompleteAction(input: {
  lessonId: string;
  enrollmentId: string;
  slug: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  const userId = session.user.id;
  const { lessonId, enrollmentId, slug } = input;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) return { ok: false };

  await db.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: { enrollmentId, lessonId },
    },
    create: {
      enrollmentId,
      lessonId,
      userId,
      watched: true,
      watchedSeconds: lesson.duration,
      watchedAt: new Date(),
    },
    update: {
      watched: true,
      watchedSeconds: lesson.duration,
      watchedAt: new Date(),
    },
  });

  await recalcCourseProgress(enrollmentId, lesson.module.courseId, userId);
  revalidatePath(`/aprender/${slug}`);
  return { ok: true };
}

async function recalcCourseProgress(
  enrollmentId: string,
  courseId: string,
  userId: string
) {
  const enrollmentBefore = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      status: true,
      course: { select: { title: true, slug: true } },
    },
  });

  const totalLessons = await db.lesson.count({
    where: { module: { courseId } },
  });

  const watchedCount = await db.lessonProgress.count({
    where: { enrollmentId, watched: true },
  });

  const progress = totalLessons > 0 ? (watchedCount / totalLessons) * 100 : 0;
  const isCompleted = progress >= 100;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      status: isCompleted ? "COMPLETED" : "ACTIVE",
      completedAt: isCompleted ? new Date() : null,
    },
  });

  if (isCompleted) {
    await ensureCertificate(enrollmentId, userId);

    // Notifica apenas na transicao (nao em recompletada)
    if (enrollmentBefore?.status !== "COMPLETED" && enrollmentBefore?.course) {
      await notifyCourseCompleted(
        userId,
        enrollmentBefore.course.title,
        enrollmentBefore.course.slug
      );
    }
  }
}

async function ensureCertificate(enrollmentId: string, userId: string) {
  const existing = await db.certificate.findUnique({ where: { enrollmentId } });
  if (existing) return;

  const number = `AVMM-${Date.now().toString(36).toUpperCase()}`;
  const validationCode =
    Math.random().toString(36).slice(2, 10).toUpperCase() +
    Math.random().toString(36).slice(2, 10).toUpperCase();

  await db.certificate.create({
    data: {
      enrollmentId,
      userId,
      number,
      validationCode,
    },
  });
}

export async function saveLessonNoteAction(input: {
  lessonId: string;
  content: string;
  timestamp: number | null;
  slug: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  const trimmed = input.content.trim();
  if (!trimmed) return { ok: false };

  await db.lessonNote.create({
    data: {
      userId: session.user.id,
      lessonId: input.lessonId,
      content: trimmed,
      timestamp: input.timestamp,
    },
  });

  revalidatePath(`/aprender/${input.slug}/aula/${input.lessonId}`);
  return { ok: true };
}

export async function deleteLessonNoteAction(input: { noteId: string; slug: string; lessonId: string }) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  await db.lessonNote.deleteMany({
    where: { id: input.noteId, userId: session.user.id },
  });

  revalidatePath(`/aprender/${input.slug}/aula/${input.lessonId}`);
  return { ok: true };
}

export async function askLessonQuestionAction(input: {
  lessonId: string;
  courseId: string;
  slug: string;
  title: string;
  body: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Nao autenticado." };

  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { ok: false, error: "Preencha titulo e descricao." };
  if (title.length > 200) return { ok: false, error: "Titulo muito longo (max 200)." };
  if (body.length > 5000) return { ok: false, error: "Descricao muito longa." };

  await db.question.create({
    data: {
      userId: session.user.id,
      lessonId: input.lessonId,
      courseId: input.courseId,
      title,
      body,
    },
  });

  const course = await db.course.findUnique({
    where: { id: input.courseId },
    select: { instructorId: true, title: true },
  });
  if (course) {
    await db.notification.create({
      data: {
        userId: course.instructorId,
        type: "GENERIC",
        title: "Nova pergunta",
        message: `Voce recebeu uma nova pergunta em ${course.title}.`,
        link: "/instrutor/perguntas",
      },
    });
  }

  revalidatePath(`/aprender/${input.slug}/aula/${input.lessonId}`);
  return { ok: true };
}

export async function replyToLessonQuestionAction(input: {
  questionId: string;
  slug: string;
  lessonId: string;
  body: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Nao autenticado." };

  const body = input.body.trim();
  if (!body) return { ok: false, error: "Resposta vazia." };

  const question = await db.question.findUnique({
    where: { id: input.questionId },
    select: { userId: true },
  });
  if (!question || question.userId !== session.user.id) {
    return { ok: false, error: "Sem permissao." };
  }

  await db.answer.create({
    data: {
      questionId: input.questionId,
      userId: session.user.id,
      body,
      isInstructor: false,
    },
  });

  revalidatePath(`/aprender/${input.slug}/aula/${input.lessonId}`);
  return { ok: true };
}
