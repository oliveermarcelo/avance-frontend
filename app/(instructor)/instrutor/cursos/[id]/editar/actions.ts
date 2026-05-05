"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireInstructor } from "@/lib/auth/instructor";

const courseSchema = z.object({
  title: z.string().trim().min(3, "Titulo precisa ter no minimo 3 caracteres").max(160),
  shortDescription: z
    .string()
    .trim()
    .max(280, "Descricao curta limitada a 280 caracteres")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(5000, "Descricao limitada a 5000 caracteres")
    .optional()
    .or(z.literal("")),
  thumbnail: z
    .string()
    .trim()
    .max(500)
    .url("URL de thumbnail invalida")
    .optional()
    .or(z.literal("")),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().min(1, "Categoria e obrigatoria"),
  price: z
    .number({ invalid_type_error: "Preco invalido" })
    .min(0, "Preco nao pode ser negativo")
    .max(99999),
  isPublished: z.boolean(),
});

export type UpdateCourseState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateInstructorCourseAction(
  courseId: string,
  prevState: UpdateCourseState | undefined,
  formData: FormData
): Promise<UpdateCourseState> {
  const user = await requireInstructor();

  const ownership = await db.course.findFirst({
    where: { id: courseId, instructorId: user.id, deletedAt: null },
    select: { id: true, slug: true, isFree: true },
  });

  if (!ownership) {
    return {
      ok: false,
      message: "Curso nao encontrado ou voce nao tem permissao",
    };
  }

  const priceRaw = String(formData.get("price") ?? "0").replace(/[^\d.,]/g, "");
  const priceNormalized = priceRaw.replace(/\./g, "").replace(",", ".");
  const priceNumber = Number(priceNormalized);

  const parsed = courseSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    thumbnail: String(formData.get("thumbnail") ?? ""),
    level: String(formData.get("level") ?? "BEGINNER"),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: Number.isFinite(priceNumber) ? priceNumber : NaN,
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  await db.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
      level: data.level,
      categoryId: data.categoryId,
      price: ownership.isFree ? 0 : data.price,
      isPublished: data.isPublished,
    },
  });

  revalidatePath(`/instrutor/cursos`);
  revalidatePath(`/instrutor/cursos/${courseId}`);
  revalidatePath(`/instrutor/cursos/${courseId}/editar`);
  revalidatePath(`/curso/${ownership.slug}`);
  revalidatePath(`/aprender/${ownership.slug}`);
  revalidatePath(`/cursos`);
  revalidatePath(`/cursos-publicos`);

  return {
    ok: true,
    message: "Curso atualizado com sucesso",
  };
}