import "server-only";
import { db } from "@/lib/db";

export async function getPublishedCourses() {
  return db.course.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    include: {
      category: { select: { name: true, slug: true, color: true } },
      instructor: { select: { name: true, avatar: true } },
    },
  });
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { courses: { where: { isPublished: true } } } },
    },
  });
}