"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type ContentActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const moduleSchema = z.object({
  title: z.string().min(2, "Titulo precisa de no minimo 2 caracteres").max(160),
  description: z.string().max(500).optional().nullable(),
});

const lessonSchema = z.object({
  title: z.string().min(2, "Titulo precisa de no minimo 2 caracteres").max(160),
  description: z.string().max(2000).optional().nullable(),
  videoUrl: z.string().url("URL de video invalida").optional().nullable().or(z.literal("")),
  duration: z.coerce.number().min(0).max(86400),
  isFree: z.boolean(),
});

async function recalcCourseStats(courseId: string) {
  const lessons = await db.lesson.findMany({
    where: { module: { courseId } },
    select: { duration: true },
  });

  await db.course.update({
    where: { id: courseId },
    data: {
      totalLessons: lessons.length,
      totalDuration: lessons.reduce((sum, l) => sum + l.duration, 0),
    },
  });
}

export async function createModuleAction(formData: FormData): Promise<ContentActionState> {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return { message: "Curso nao encontrado" };

  const parsed = moduleSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const lastModule = await db.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.module.create({
    data: {
      courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      order: (lastModule?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/cursos/${courseId}/conteudo`);
  return { ok: true, message: "Modulo criado" };
}

export async function updateModuleAction(formData: FormData): Promise<ContentActionState> {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "");
  if (!moduleId) return { message: "Modulo nao encontrado" };

  const parsed = moduleSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const updated = await db.module.update({
    where: { id: moduleId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
    },
    select: { courseId: true },
  });

  revalidatePath(`/admin/cursos/${updated.courseId}/conteudo`);
  return { ok: true, message: "Modulo atualizado" };
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "");
  if (!moduleId) return;

  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return;

  await db.module.delete({ where: { id: moduleId } });
  await recalcCourseStats(mod.courseId);

  revalidatePath(`/admin/cursos/${mod.courseId}/conteudo`);
}

export async function reorderModuleAction(formData: FormData) {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!moduleId || (direction !== "up" && direction !== "down")) return;

  const current = await db.module.findUnique({
    where: { id: moduleId },
    select: { id: true, order: true, courseId: true },
  });
  if (!current) return;

  const neighbor = await db.module.findFirst({
    where: {
      courseId: current.courseId,
      order: direction === "up" ? { lt: current.order } : { gt: current.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });

  if (!neighbor) return;

  await db.$transaction([
    db.module.update({
      where: { id: current.id },
      data: { order: -1 },
    }),
    db.module.update({
      where: { id: neighbor.id },
      data: { order: current.order },
    }),
    db.module.update({
      where: { id: current.id },
      data: { order: neighbor.order },
    }),
  ]);

  revalidatePath(`/admin/cursos/${current.courseId}/conteudo`);
}

export async function createLessonAction(formData: FormData): Promise<ContentActionState> {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "");
  if (!moduleId) return { message: "Modulo nao encontrado" };

  const parsed = lessonSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    duration: String(formData.get("duration") ?? "0"),
    isFree: formData.get("isFree") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return { message: "Modulo nao encontrado" };

  const lastLesson = await db.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      description: parsed.data.description,
      videoUrl: parsed.data.videoUrl || null,
      duration: parsed.data.duration,
      isFree: parsed.data.isFree,
      order: (lastLesson?.order ?? 0) + 1,
    },
  });

  await recalcCourseStats(mod.courseId);
  revalidatePath(`/admin/cursos/${mod.courseId}/conteudo`);
  return { ok: true, message: "Aula criada" };
}

export async function updateLessonAction(formData: FormData): Promise<ContentActionState> {
  await requireAdmin();
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) return { message: "Aula nao encontrada" };

  const parsed = lessonSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    duration: String(formData.get("duration") ?? "0"),
    isFree: formData.get("isFree") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const updated = await db.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      videoUrl: parsed.data.videoUrl || null,
      duration: parsed.data.duration,
      isFree: parsed.data.isFree,
    },
    select: { module: { select: { courseId: true } } },
  });

  await recalcCourseStats(updated.module.courseId);
  revalidatePath(`/admin/cursos/${updated.module.courseId}/conteudo`);
  return { ok: true, message: "Aula atualizada" };
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdmin();
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) return;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) return;

  await db.lesson.delete({ where: { id: lessonId } });
  await recalcCourseStats(lesson.module.courseId);

  revalidatePath(`/admin/cursos/${lesson.module.courseId}/conteudo`);
}

export async function reorderLessonAction(formData: FormData) {
  await requireAdmin();
  const lessonId = String(formData.get("lessonId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!lessonId || (direction !== "up" && direction !== "down")) return;

  const current = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, order: true, moduleId: true, module: { select: { courseId: true } } },
  });
  if (!current) return;

  const neighbor = await db.lesson.findFirst({
    where: {
      moduleId: current.moduleId,
      order: direction === "up" ? { lt: current.order } : { gt: current.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });

  if (!neighbor) return;

  await db.$transaction([
    db.lesson.update({
      where: { id: current.id },
      data: { order: -1 },
    }),
    db.lesson.update({
      where: { id: neighbor.id },
      data: { order: current.order },
    }),
    db.lesson.update({
      where: { id: current.id },
      data: { order: neighbor.order },
    }),
  ]);

  revalidatePath(`/admin/cursos/${current.module.courseId}/conteudo`);
}