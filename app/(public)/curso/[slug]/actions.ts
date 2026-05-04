"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type EnrollFreeState = {
  ok?: boolean;
  message?: string;
  redirectTo?: string;
};

export async function enrollInFreeCourseAction(
  formData: FormData
): Promise<EnrollFreeState> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      message: "Voce precisa estar logado",
      redirectTo: "/login",
    };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!courseId) return { message: "Curso nao encontrado" };

  const course = await db.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { id: true, isPublished: true, isFree: true },
  });

  if (!course || !course.isPublished) {
    return { message: "Curso nao disponivel" };
  }

  if (!course.isFree) {
    return {
      message: "Esse curso nao e gratuito. Use o checkout para adquiri-lo.",
    };
  }

  const existing = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });

  if (existing && (existing.status === "ACTIVE" || existing.status === "COMPLETED")) {
    return {
      ok: true,
      message: "Voce ja esta matriculado",
      redirectTo: `/aprender/${slug}`,
    };
  }

  if (existing) {
    await db.enrollment.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", expiresAt: null, enrolledAt: new Date() },
    });
  } else {
    await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });
    await db.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    });
  }

  revalidatePath(`/curso/${slug}`);
  revalidatePath("/meus-cursos");

  return {
    ok: true,
    message: "Matricula efetuada com sucesso",
    redirectTo: `/aprender/${slug}`,
  };
}