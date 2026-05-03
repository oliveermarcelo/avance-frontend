"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type EnrollmentActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const createEnrollmentSchema = z.object({
  userId: z.string().min(1, "Aluno obrigatorio"),
  courseId: z.string().min(1, "Curso obrigatorio"),
});

export async function createEnrollmentAction(
  formData: FormData
): Promise<EnrollmentActionState> {
  await requireAdmin();
  const parsed = createEnrollmentSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    courseId: String(formData.get("courseId") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { userId, courseId } = parsed.data;

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    if (existing.status === "ACTIVE" || existing.status === "COMPLETED") {
      return {
        message: "Esse aluno ja esta matriculado neste curso",
      };
    }
    await db.enrollment.update({
      where: { id: existing.id },
      data: {
        status: "ACTIVE",
        expiresAt: null,
        enrolledAt: new Date(),
      },
    });
  } else {
    await db.enrollment.create({
      data: {
        userId,
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

  revalidatePath("/admin/matriculas");
  return { ok: true, message: "Aluno matriculado com sucesso" };
}

export async function cancelEnrollmentAction(formData: FormData) {
  await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) return;

  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { courseId: true, status: true },
  });
  if (!enrollment) return;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "CANCELLED" },
  });

  if (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED") {
    await db.course.update({
      where: { id: enrollment.courseId },
      data: { enrollmentCount: { decrement: 1 } },
    });
  }

  revalidatePath("/admin/matriculas");
}

export async function reactivateEnrollmentAction(formData: FormData) {
  await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) return;

  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { courseId: true, status: true },
  });
  if (!enrollment) return;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "ACTIVE", expiresAt: null },
  });

  if (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED") {
    await db.course.update({
      where: { id: enrollment.courseId },
      data: { enrollmentCount: { increment: 1 } },
    });
  }

  revalidatePath("/admin/matriculas");
}

const extendSchema = z.object({
  enrollmentId: z.string().min(1),
  daysToAdd: z.coerce.number().min(1).max(3650),
});

export async function extendEnrollmentAction(
  formData: FormData
): Promise<EnrollmentActionState> {
  await requireAdmin();
  const parsed = extendSchema.safeParse({
    enrollmentId: String(formData.get("enrollmentId") ?? ""),
    daysToAdd: String(formData.get("daysToAdd") ?? "0"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const enrollment = await db.enrollment.findUnique({
    where: { id: parsed.data.enrollmentId },
    select: { expiresAt: true },
  });
  if (!enrollment) return { message: "Matricula nao encontrada" };

  const baseDate = enrollment.expiresAt && enrollment.expiresAt > new Date()
    ? enrollment.expiresAt
    : new Date();

  const newExpiresAt = new Date(baseDate);
  newExpiresAt.setDate(newExpiresAt.getDate() + parsed.data.daysToAdd);

  await db.enrollment.update({
    where: { id: parsed.data.enrollmentId },
    data: { expiresAt: newExpiresAt },
  });

  revalidatePath("/admin/matriculas");
  return { ok: true, message: `Acesso estendido por ${parsed.data.daysToAdd} dias` };
}