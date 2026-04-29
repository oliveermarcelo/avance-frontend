"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

const courseSchema = z.object({
  title: z.string().min(3, "Titulo precisa de no minimo 3 caracteres").max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug deve ter apenas letras minusculas, numeros e hifens"),
  shortDescription: z.string().min(10).max(280),
  description: z.string().max(5000).optional().nullable(),
  categoryId: z.string().nullable().optional(),
  instructorId: z.string().min(1, "Instrutor obrigatorio"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.coerce.number().min(0).max(100000),
  isFree: z.boolean(),
  isPremium: z.boolean(),
  thumbnail: z.string().url().optional().nullable().or(z.literal("")),
  trailer: z.string().url().optional().nullable().or(z.literal("")),
});

export type CourseFormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    instructorId: String(formData.get("instructorId") ?? ""),
    level: String(formData.get("level") ?? "INTERMEDIATE"),
    price: String(formData.get("price") ?? "0"),
    isFree: formData.get("isFree") === "on",
    isPremium: formData.get("isPremium") === "on",
    thumbnail: String(formData.get("thumbnail") ?? "").trim() || null,
    trailer: String(formData.get("trailer") ?? "").trim() || null,
  };
}

export async function createCourseAction(
  _prev: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const existing = await db.course.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { fieldErrors: { slug: ["Esse slug ja esta em uso"] } };
  }

  const created = await db.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      instructorId: data.instructorId,
      level: data.level,
      price: data.isFree ? 0 : data.price,
      isFree: data.isFree,
      isPremium: data.isPremium,
      thumbnail: data.thumbnail,
      trailer: data.trailer,
      isPublished: false,
    },
  });

  revalidatePath("/admin/cursos");
  redirect(`/admin/cursos/${created.id}`);
}

export async function updateCourseAction(
  _prev: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return { message: "Curso nao encontrado" };

  const parsed = courseSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const slugConflict = await db.course.findFirst({
    where: { slug: data.slug, id: { not: courseId } },
  });
  if (slugConflict) {
    return { fieldErrors: { slug: ["Esse slug ja esta em uso"] } };
  }

  await db.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      instructorId: data.instructorId,
      level: data.level,
      price: data.isFree ? 0 : data.price,
      isFree: data.isFree,
      isPremium: data.isPremium,
      thumbnail: data.thumbnail,
      trailer: data.trailer,
    },
  });

  revalidatePath("/admin/cursos");
  revalidatePath(`/admin/cursos/${courseId}`);
  return { ok: true, message: "Curso atualizado com sucesso" };
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();
  const courseId = formData.get("courseId") as string;
  if (!courseId) return;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { isPublished: true },
  });
  if (!course) return;

  await db.course.update({
    where: { id: courseId },
    data: {
      isPublished: !course.isPublished,
      publishedAt: !course.isPublished ? new Date() : null,
    },
  });

  revalidatePath("/admin/cursos");
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = formData.get("courseId") as string;
  if (!courseId) return;

  await db.course.update({
    where: { id: courseId },
    data: { deletedAt: new Date(), isPublished: false },
  });

  revalidatePath("/admin/cursos");
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireAdmin();
  const courseId = formData.get("courseId") as string;
  if (!courseId) return;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { isFeatured: true },
  });
  if (!course) return;

  await db.course.update({
    where: { id: courseId },
    data: { isFeatured: !course.isFeatured },
  });

  revalidatePath("/admin/cursos");
}