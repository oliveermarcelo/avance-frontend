import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserNotifications } from "@/lib/data/notifications";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
  const onlyUnread = searchParams.get("unread") === "true";

  const notifications = await getUserNotifications(session.user.id, {
    limit,
    onlyUnread,
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      readAt: n.readAt?.toISOString(),
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export const dynamic = "force-dynamic";