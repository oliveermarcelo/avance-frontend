"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type PaymentActionState = {
  ok?: boolean;
  message?: string;
};

export async function markAsPaidAction(formData: FormData): Promise<PaymentActionState> {
  await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return { message: "Pagamento nao encontrado" };

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: { status: true, userId: true, courseId: true },
  });

  if (!payment) return { message: "Pagamento nao encontrado" };
  if (payment.status === "PAID") return { message: "Esse pagamento ja esta marcado como pago" };

  await db.payment.update({
    where: { id: paymentId },
    data: { status: "PAID", paidAt: new Date() },
  });

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: payment.userId, courseId: payment.courseId },
    },
  });

  if (!enrollment) {
    await db.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });
    await db.course.update({
      where: { id: payment.courseId },
      data: { enrollmentCount: { increment: 1 } },
    });
  } else if (enrollment.status === "CANCELLED" || enrollment.status === "EXPIRED") {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "ACTIVE", expiresAt: null },
    });
    await db.course.update({
      where: { id: payment.courseId },
      data: { enrollmentCount: { increment: 1 } },
    });
  }

  revalidatePath("/admin/pagamentos");
  revalidatePath("/admin/matriculas");
  return { ok: true, message: "Pagamento confirmado e aluno matriculado" };
}

export async function refundPaymentAction(formData: FormData): Promise<PaymentActionState> {
  await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return { message: "Pagamento nao encontrado" };

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: { status: true, userId: true, courseId: true },
  });

  if (!payment) return { message: "Pagamento nao encontrado" };
  if (payment.status !== "PAID") {
    return { message: "Apenas pagamentos pagos podem ser estornados" };
  }

  await db.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED" },
  });

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: payment.userId, courseId: payment.courseId },
    },
  });

  if (enrollment && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED")) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "CANCELLED" },
    });
    await db.course.update({
      where: { id: payment.courseId },
      data: { enrollmentCount: { decrement: 1 } },
    });
  }

  revalidatePath("/admin/pagamentos");
  revalidatePath("/admin/matriculas");
  return { ok: true, message: "Pagamento estornado e matricula cancelada" };
}