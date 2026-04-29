"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type CategoryActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const categorySchema = z.object({
  name: z.string().min(2, "Nome precisa de no minimo 2 caracteres").max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug deve ter apenas letras minusculas, numeros e hifens"),
  description: z.string().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser hexadecimal (ex: #1F3A2D)")
    .optional()
    .nullable()
    .or(z.literal("")),
});

function parseFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    description: String(formData.get("description") ?? "").trim() || null,
    color: String(formData.get("color") ?? "").trim() || null,
  };
}

export async function createCategoryAction(
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { fieldErrors: { slug: ["Esse slug ja esta em uso"] } };
  }

  const lastCategory = await db.category.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      color: parsed.data.color,
      order: (lastCategory?.order ?? 0) + 1,
    },
  });

  revalidatePath("/admin/categorias");
  return { ok: true, message: "Categoria criada" };
}

export async function updateCategoryAction(
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return { message: "Categoria nao encontrada" };

  const parsed = categorySchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slugConflict = await db.category.findFirst({
    where: { slug: parsed.data.slug, id: { not: categoryId } },
  });
  if (slugConflict) {
    return { fieldErrors: { slug: ["Esse slug ja esta em uso"] } };
  }

  await db.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      color: parsed.data.color,
    },
  });

  revalidatePath("/admin/categorias");
  return { ok: true, message: "Categoria atualizada" };
}

export async function deleteCategoryAction(formData: FormData): Promise<CategoryActionState> {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return { message: "Categoria nao encontrada" };

  const courseCount = await db.course.count({
    where: { categoryId, deletedAt: null },
  });

  if (courseCount > 0) {
    return {
      message: `Nao e possivel excluir: ${courseCount} curso(s) usam essa categoria. Remova ou troque a categoria deles primeiro.`,
    };
  }

  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categorias");
  return { ok: true };
}

export async function reorderCategoryAction(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!categoryId || (direction !== "up" && direction !== "down")) return;

  const current = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true, order: true },
  });
  if (!current) return;

  const neighbor = await db.category.findFirst({
    where: {
      order: direction === "up" ? { lt: current.order } : { gt: current.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });

  if (!neighbor) return;

  await db.$transaction([
    db.category.update({
      where: { id: current.id },
      data: { order: -1 },
    }),
    db.category.update({
      where: { id: neighbor.id },
      data: { order: current.order },
    }),
    db.category.update({
      where: { id: current.id },
      data: { order: neighbor.order },
    }),
  ]);

  revalidatePath("/admin/categorias");
}