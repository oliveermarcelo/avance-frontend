"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markAllAsRead, markAsRead } from "@/lib/data/notifications";

export async function markAllAsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  await markAllAsRead(session.user.id);
  revalidatePath("/notificacoes");
  return { ok: true };
}

export async function markOneAsReadAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  await markAsRead(id, session.user.id);
  revalidatePath("/notificacoes");
  return { ok: true };
}