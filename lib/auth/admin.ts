import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/inicio");
  }

  return user;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  return user?.role === "ADMIN" && user.isActive === true;
}