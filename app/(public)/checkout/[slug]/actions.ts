"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPaymentGateway } from "@/lib/payments/factory";
import { getActiveGateway } from "@/lib/settings";
import { notifyEnrollmentCreated, notifyPaymentConfirmed } from "@/lib/data/notifications";
import type { PaymentMethod, CheckoutInput } from "@/lib/payments/types";

const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  cpf: z.string().min(11).max(14),
  phone: z.string().max(40).optional().nullable(),
});

const cardSchema = z.object({
  holderName: z.string().min(2),
  number: z.string().min(13).max(19),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(2).max(4),
  cvv: z.string().min(3).max(4),
  installments: z.number().int().min(1).max(12).optional(),
});

const checkoutSchema = z
  .object({
    courseId: z.string().min(1),
    method: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
    customer: customerSchema,
    card: cardSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.method === "CREDIT_CARD") return !!data.card;
      return true;
    },
    { message: "Dados do cartao sao obrigatorios", path: ["card"] }
  );

export type CreateCheckoutState = {
  ok?: boolean;
  message?: string;
  transactionId?: string;
  paymentId?: string;
  redirectTo?: string;
};

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export async function createCheckoutAction(
  formData: FormData
): Promise<CreateCheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Voce precisa estar logado", redirectTo: "/login" };
  }

  const rawCard = formData.get("card") ? JSON.parse(String(formData.get("card"))) : null;
  const rawCustomer = JSON.parse(String(formData.get("customer") ?? "{}"));

  const parsed = checkoutSchema.safeParse({
    courseId: String(formData.get("courseId") ?? ""),
    method: String(formData.get("method") ?? "PIX") as PaymentMethod,
    customer: {
      ...rawCustomer,
      cpf: onlyDigits(String(rawCustomer.cpf ?? "")),
      phone: rawCustomer.phone ? onlyDigits(String(rawCustomer.phone)) : null,
    },
    card: rawCard
      ? {
          ...rawCard,
          number: onlyDigits(String(rawCard.number ?? "")),
          installments: Number(rawCard.installments ?? 1),
        }
      : undefined,
  });

  if (!parsed.success) {
    return {
      message: "Dados invalidos: " + parsed.error.issues[0]?.message,
    };
  }

  const data = parsed.data;

  const course = await db.course.findUnique({
    where: { id: data.courseId, deletedAt: null, isPublished: true },
    select: { id: true, slug: true, title: true, price: true, isFree: true },
  });

  if (!course) {
    return { message: "Curso nao encontrado" };
  }

  if (course.isFree) {
    return { message: "Curso gratuito, use a matricula gratuita" };
  }

  const existing = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: course.id },
    },
  });

  if (existing && (existing.status === "ACTIVE" || existing.status === "COMPLETED")) {
    return {
      ok: true,
      redirectTo: `/aprender/${course.slug}`,
      message: "Voce ja esta matriculado",
    };
  }

  const activeGateway = await getActiveGateway();
  if (activeGateway === "NONE") {
    return {
      message: "Pagamentos nao estao configurados. Contate o suporte.",
    };
  }

  const gateway = await getPaymentGateway();
  if (!gateway) {
    return { message: "Gateway de pagamento indisponivel" };
  }

  const payment = await db.payment.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      amount: course.price,
      status: "PENDING",
      gateway: activeGateway as "ASAAS" | "MERCADO_PAGO" | "STRIPE" | "MANUAL",
      method: data.method,
    },
  });

  const checkoutInput: CheckoutInput = {
    paymentId: payment.id,
    courseId: course.id,
    courseTitle: course.title,
    amountInCents: Math.round(Number(course.price) * 100),
    method: data.method,
    customer: {
      name: data.customer.name,
      email: data.customer.email,
      cpf: data.customer.cpf,
      phone: data.customer.phone ?? undefined,
    },
    card: data.card,
  };

  let result;
  try {
    result = await gateway.createCheckout(checkoutInput);
  } catch (e) {
    const error = e as Error;
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", metadata: { error: error.message } },
    });
    return { message: `Erro no gateway: ${error.message}` };
  }

  if (!result.ok) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        metadata: { error: result.errorMessage ?? "unknown" },
      },
    });
    return { message: result.errorMessage ?? "Falha ao processar pagamento" };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: result.transactionId,
      status: result.status === "PAID" ? "PAID" : "PENDING",
      paidAt: result.status === "PAID" ? new Date() : null,
      metadata: {
        pix: result.pix
          ? {
              qrCode: result.pix.qrCode,
              qrCodeImage: result.pix.qrCodeImage,
              expiresAt: result.pix.expiresAt.toISOString(),
            }
          : undefined,
        boleto: result.boleto
          ? {
              barcode: result.boleto.barcode,
              pdfUrl: result.boleto.pdfUrl,
              dueDate: result.boleto.dueDate.toISOString(),
            }
          : undefined,
      },
    },
  });

  if (result.status === "PAID") {
    await ensureEnrollment(session.user.id, course.id);
    await notifyPaymentConfirmed(
      session.user.id,
      course.title,
      course.slug,
      Number(course.price)
    );
    revalidatePath(`/curso/${course.slug}`);
    revalidatePath("/meus-cursos");
    return {
      ok: true,
      paymentId: payment.id,
      transactionId: result.transactionId,
      redirectTo: `/checkout/${course.slug}/sucesso?tx=${result.transactionId}`,
    };
  }

  return {
    ok: true,
    paymentId: payment.id,
    transactionId: result.transactionId,
    redirectTo: `/checkout/${course.slug}/aguardando?tx=${result.transactionId}`,
  };
}

async function ensureEnrollment(userId: string, courseId: string) {
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true, slug: true },
  });

  if (existing) {
    if (existing.status !== "ACTIVE" && existing.status !== "COMPLETED") {
      await db.enrollment.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", expiresAt: null, enrolledAt: new Date() },
      });
      if (course) {
        await notifyEnrollmentCreated(userId, course.title, course.slug);
      }
    }
    return;
  }

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

  if (course) {
    await notifyEnrollmentCreated(userId, course.title, course.slug);
  }
}

export type CheckPaymentState = {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED" | "NOT_FOUND";
  redirectTo?: string;
};

export async function checkPaymentStatusAction(
  transactionId: string
): Promise<CheckPaymentState> {
  if (!transactionId) return { status: "NOT_FOUND" };

  const payment = await db.payment.findFirst({
    where: { transactionId },
    include: { course: { select: { slug: true } } },
  });

  if (!payment) return { status: "NOT_FOUND" };

  if (payment.status === "PAID") {
    return {
      status: "PAID",
      redirectTo: `/checkout/${payment.course.slug}/sucesso?tx=${transactionId}`,
    };
  }

  if (payment.status === "FAILED" || payment.status === "REFUNDED") {
    return { status: payment.status };
  }

  const gateway = await getPaymentGateway();
  if (!gateway) return { status: "PENDING" };

  let statusResult;
  try {
    statusResult = await gateway.getPaymentStatus(transactionId);
  } catch {
    return { status: "PENDING" };
  }

  if (statusResult.status === "PAID") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: statusResult.paidAt ?? new Date() },
    });
    await ensureEnrollment(payment.userId, payment.courseId);
    revalidatePath("/meus-cursos");

    return {
      status: "PAID",
      redirectTo: `/checkout/${payment.course.slug}/sucesso?tx=${transactionId}`,
    };
  }

  if (statusResult.status === "FAILED") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { status: "FAILED" };
  }

  return { status: "PENDING" };
}

export async function simulateMockPaymentSuccessAction(
  transactionId: string
): Promise<{ ok: boolean; redirectTo?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  const payment = await db.payment.findFirst({
    where: { transactionId, userId: session.user.id },
    include: { course: { select: { slug: true } } },
  });

  if (!payment || payment.gateway !== "MANUAL") {
    const activeGateway = await getActiveGateway();
    if (activeGateway !== "MOCK") return { ok: false };
  }

  if (!payment) return { ok: false };

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: new Date() },
  });

  await ensureEnrollment(payment.userId, payment.courseId);
  revalidatePath("/meus-cursos");

  return {
    ok: true,
    redirectTo: `/checkout/${payment.course.slug}/sucesso?tx=${transactionId}`,
  };
}