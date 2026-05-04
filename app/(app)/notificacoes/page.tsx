import { Header } from "@/components/avance/header";
import { NotificationsList } from "@/components/avance/notifications-list";
import { getCurrentUser } from "@/lib/data/user";
import {
  getUserNotifications,
  getUnreadCount,
} from "@/lib/data/notifications";

export default async function NotificacoesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, { limit: 50 }),
    getUnreadCount(user.id),
  ]);

  const initialNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <>
      <Header subtitle="Central de notificacoes" title="Notificacoes" />

      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <NotificationsList
          initialNotifications={initialNotifications}
          initialUnreadCount={unreadCount}
        />
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";