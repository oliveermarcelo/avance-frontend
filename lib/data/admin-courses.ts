import "server-only";
import { db } from "@/lib/db";

export async function getAdminCourses() {
  return db.course.findMany({
    where: { deletedAt: null },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true } },
      _count: {
        select: {
          enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } } },
          modules: true,
        },
      },
    },
  });
}

export async function getAdminCourseById(id: string) {
  return db.course.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, email: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}