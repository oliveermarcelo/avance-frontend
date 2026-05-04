import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAllAsRead } from "@/lib/data/notifications";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const result = await markAllAsRead(session.user.id);
  return NextResponse.json({ ok: true, updated: result.count });
}

export const dynamic = "force-dynamic";