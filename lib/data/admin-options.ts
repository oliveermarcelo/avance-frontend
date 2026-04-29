import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export async function getInstructorsAndCategories() {
  await requireAdmin();
  const [instructors, categories] = await Promise.all([
    db.user.findMany({
      where: { role: { in: ["INSTRUCTOR", "ADMIN"] }, isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return { instructors, categories };
}