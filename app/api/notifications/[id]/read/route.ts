import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAsRead } from "@/lib/data/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });
  }

  const result = await markAsRead(id, session.user.id);
  return NextResponse.json({ ok: true, updated: result.count });
}

export const dynamic = "force-dynamic";