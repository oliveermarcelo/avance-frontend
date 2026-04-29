"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export type UserActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  generatedPassword?: string;
};

const userSchema = z.object({
  name: z.string().min(2, "Nome precisa de no minimo 2 caracteres").max(120),
  email: z.string().email("E-mail invalido").max(160),
  phone: z.string().max(40).optional().nullable().or(z.literal("")),
  crm: z.string().max(40).optional().nullable().or(z.literal("")),
  bio: z.string().max(2000).optional().nullable().or(z.literal("")),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

function parseFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    crm: String(formData.get("crm") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    role: String(formData.get("role") ?? "STUDENT"),
  };
}

export async function updateUserAction(formData: FormData): Promise<UserActionState> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { message: "Usuario nao encontrado" };

  const parsed = userSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const emailConflict = await db.user.findFirst({
    where: { email: data.email, id: { not: userId } },
  });
  if (emailConflict) {
    return { fieldErrors: { email: ["Esse e-mail ja esta em uso"] } };
  }

  if (userId === admin.id && data.role !== "ADMIN") {
    return {
      fieldErrors: {
        role: ["Voce nao pode rebaixar o proprio papel. Pec,a a outro admin."],
      },
    };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      crm: data.crm,
      bio: data.bio,
      role: data.role,
    },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true, message: "Usuario atualizado" };
}

export async function toggleUserActiveAction(formData: FormData): Promise<UserActionState> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { message: "Usuario nao encontrado" };

  if (userId === admin.id) {
    return { message: "Voce nao pode desativar a propria conta" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  if (!user) return { message: "Usuario nao encontrado" };

  await db.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true };
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function resetUserPasswordAction(formData: FormData): Promise<UserActionState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { message: "Usuario nao encontrado" };

  const tempPassword = generateTempPassword();
  const hashed = await hashPassword(tempPassword);

  await db.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  await db.session.deleteMany({ where: { userId } });

  revalidatePath(`/admin/usuarios/${userId}`);
  return {
    ok: true,
    message: "Senha resetada com sucesso",
    generatedPassword: tempPassword,
  };
}