"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireInstructor } from "@/lib/auth/instructor";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter no minimo 2 caracteres").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  crm: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio limitada a 500 caracteres")
    .optional()
    .or(z.literal("")),
  avatar: z
    .string()
    .trim()
    .max(500)
    .url("URL de avatar invalida")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateInstructorProfileAction(
  prevState: UpdateProfileState | undefined,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await requireInstructor();

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    crm: String(formData.get("crm") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    avatar: String(formData.get("avatar") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  await db.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      crm: data.crm || null,
      bio: data.bio || null,
      avatar: data.avatar || null,
    },
  });

  revalidatePath("/instrutor");
  revalidatePath("/instrutor/perfil");

  const courses = await db.course.findMany({
    where: { instructorId: user.id, deletedAt: null, isPublished: true },
    select: { slug: true },
  });
  for (const c of courses) {
    revalidatePath(`/curso/${c.slug}`);
    revalidatePath(`/aprender/${c.slug}`);
  }

  return {
    ok: true,
    message: "Perfil atualizado com sucesso",
  };
}