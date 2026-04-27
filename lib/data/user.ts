import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      crm: true,
      avatar: true,
      role: true,
      bio: true,
      phone: true,
    },
  });
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRoleLabel(role: "STUDENT" | "INSTRUCTOR" | "ADMIN"): string {
  const labels = {
    STUDENT: "Aluno",
    INSTRUCTOR: "Instrutor",
    ADMIN: "Administrador",
  };
  return labels[role];
}