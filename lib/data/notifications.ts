import "server-only";
import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function getUserNotifications(
  userId: string,
  options: { limit?: number; onlyUnread?: boolean } = {}
) {
  const { limit = 20, onlyUnread = false } = options;

  return db.notification.findMany({
    where: {
      userId,
      ...(onlyUnread ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: { id: notificationId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function notifyWelcome(userId: string, name: string) {
  const firstName = name.split(" ")[0];
  return createNotification({
    userId,
    type: "WELCOME",
    title: `Bem-vindo a Avance MentorMed, ${firstName}!`,
    message: "Conheca nossos cursos e comece sua jornada de aprendizado agora.",
    link: "/cursos",
  });
}

export async function notifyEnrollmentCreated(userId: string, courseTitle: string, courseSlug: string) {
  return createNotification({
    userId,
    type: "ENROLLMENT_CREATED",
    title: "Matricula confirmada",
    message: `Voce foi matriculado no curso "${courseTitle}". Bons estudos!`,
    link: `/aprender/${courseSlug}`,
  });
}

export async function notifyPaymentConfirmed(userId: string, courseTitle: string, courseSlug: string, amount: number) {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  return createNotification({
    userId,
    type: "PAYMENT_CONFIRMED",
    title: "Pagamento aprovado",
    message: `Pagamento de ${formattedAmount} para "${courseTitle}" foi confirmado. Acesso liberado!`,
    link: `/aprender/${courseSlug}`,
  });
}

export async function notifyPaymentFailed(userId: string, courseTitle: string, courseSlug: string) {
  return createNotification({
    userId,
    type: "PAYMENT_FAILED",
    title: "Pagamento nao processado",
    message: `Houve um problema com o pagamento do curso "${courseTitle}". Tente novamente ou escolha outro metodo.`,
    link: `/curso/${courseSlug}`,
  });
}

export async function notifyCourseCompleted(userId: string, courseTitle: string, courseSlug: string) {
  return createNotification({
    userId,
    type: "COURSE_COMPLETED",
    title: "Parabens, curso concluido!",
    message: `Voce concluiu "${courseTitle}". Seu certificado esta disponivel.`,
    link: `/certificados`,
  });
}