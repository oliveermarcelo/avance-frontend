import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDefaultRouteForRole } from "@/lib/auth/role-routes";

export async function requireInstructor() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true, crm: true, bio: true },
  });

  if (!user || !user.isActive) {
    redirect("/login");
  }

  if (user.role !== "INSTRUCTOR") {
    redirect(getDefaultRouteForRole(user.role));
  }

  return user;
}

export async function isInstructor(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  return user?.role === "INSTRUCTOR" && user.isActive === true;
}