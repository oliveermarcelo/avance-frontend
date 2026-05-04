"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function enrollAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const courseId = formData.get("courseId") as string;
  const slug = formData.get("slug") as string;
  if (!courseId) return;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { isFree: true, isPublished: true },
  });

  if (!course || !course.isPublished) return;

  if (!course.isFree) {
    redirect(`/curso/${slug}`);
  }

  await db.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    create: {
      userId: session.user.id,
      courseId,
      status: "ACTIVE",
      startedAt: new Date(),
    },
    update: {
      status: "ACTIVE",
    },
  });

  await db.course.update({
    where: { id: courseId },
    data: { enrollmentCount: { increment: 1 } },
  });

  revalidatePath(`/aprender/${slug}`);
  revalidatePath("/inicio");
  revalidatePath("/meus-cursos");
  redirect(`/aprender/${slug}`);
}