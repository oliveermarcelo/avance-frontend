import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentGateway } from "@/lib/payments/factory";
import {
  notifyEnrollmentCreated,
  notifyPaymentConfirmed,
} from "@/lib/data/notifications";

export async function POST(req: NextRequest) {
  const gateway = await getPaymentGateway();
  if (!gateway?.validateWebhook) {
    return NextResponse.json(
      { error: "gateway not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const headerObj: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headerObj[key.toLowerCase()] = value;
  });

  const event = gateway.validateWebhook(headerObj, body);
  if (!event) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payment = await db.payment.findFirst({
    where: { transactionId: event.transactionId },
    include: { course: { select: { id: true, slug: true, title: true, price: true } } },
  });

  if (!payment) {
    return NextResponse.json({ ok: true, ignored: "payment not found" });
  }

  if (event.status === "PAID" && payment.status !== "PAID") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: event.paidAt ?? new Date() },
    });
    await ensureEnrollmentFromWebhook(
      payment.userId,
      payment.course.id,
      payment.course.title,
      payment.course.slug,
      Number(payment.course.price)
    );
  } else if (event.status === "REFUNDED" && payment.status !== "REFUNDED") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
  } else if (event.status === "FAILED" && payment.status !== "FAILED") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}

async function ensureEnrollmentFromWebhook(
  userId: string,
  courseId: string,
  courseTitle: string,
  courseSlug: string,
  coursePrice: number
) {
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    if (existing.status !== "ACTIVE" && existing.status !== "COMPLETED") {
      await db.enrollment.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", expiresAt: null, enrolledAt: new Date() },
      });
      await notifyEnrollmentCreated(userId, courseTitle, courseSlug);
    }
  } else {
    await db.enrollment.create({
      data: { userId, courseId, status: "ACTIVE", progress: 0 },
    });
    await db.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    });
    await notifyEnrollmentCreated(userId, courseTitle, courseSlug);
  }

  await notifyPaymentConfirmed(userId, courseTitle, courseSlug, coursePrice);
}