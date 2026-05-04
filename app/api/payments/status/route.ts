import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPaymentGateway } from "@/lib/payments/factory";
import { notifyEnrollmentCreated, notifyPaymentConfirmed } from "@/lib/data/notifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tx = searchParams.get("tx");

  if (!tx) {
    return NextResponse.json({ status: "NOT_FOUND" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401 });
  }

  const payment = await db.payment.findFirst({
    where: { transactionId: tx, userId: session.user.id },
    include: { course: { select: { slug: true, title: true } } },
  });

  if (!payment) {
    return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json({
      status: "PAID",
      redirectTo: `/checkout/${payment.course.slug}/sucesso?tx=${tx}`,
    });
  }

  if (payment.status === "FAILED" || payment.status === "REFUNDED") {
    return NextResponse.json({ status: payment.status });
  }

  const gateway = await getPaymentGateway();
  if (!gateway) {
    return NextResponse.json({ status: "PENDING" });
  }

  try {
    const result = await gateway.getPaymentStatus(tx);

    if (result.status === "PAID") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: result.paidAt ?? new Date() },
      });

      const existing = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId: payment.userId, courseId: payment.courseId },
        },
      });

      if (!existing) {
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
        await notifyEnrollmentCreated(payment.userId, payment.course.title, payment.course.slug);
      } else if (existing.status !== "ACTIVE" && existing.status !== "COMPLETED") {
        await db.enrollment.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", expiresAt: null, enrolledAt: new Date() },
        });
        await notifyEnrollmentCreated(payment.userId, payment.course.title, payment.course.slug);
      }

      await notifyPaymentConfirmed(
        payment.userId,
        payment.course.title,
        payment.course.slug,
        Number(payment.amount)
      );

      return NextResponse.json({
        status: "PAID",
        redirectTo: `/checkout/${payment.course.slug}/sucesso?tx=${tx}`,
      });
    }

    if (result.status === "FAILED") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ status: "FAILED" });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch {
    return NextResponse.json({ status: "PENDING" });
  }
}

export const dynamic = "force-dynamic";