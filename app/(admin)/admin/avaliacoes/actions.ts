"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;

  const review = await db.courseReview.findUnique({
    where: { id: reviewId },
    select: { courseId: true, rating: true },
  });
  if (!review) return;

  await db.courseReview.delete({ where: { id: reviewId } });

  const remaining = await db.courseReview.findMany({
    where: { courseId: review.courseId },
    select: { rating: true },
  });

  const newAverage =
    remaining.length > 0
      ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
      : 0;

  await db.course.update({
    where: { id: review.courseId },
    data: {
      averageRating: newAverage,
    },
  });

  revalidatePath("/admin/avaliacoes");
  revalidatePath(`/admin/cursos/${review.courseId}`);
}