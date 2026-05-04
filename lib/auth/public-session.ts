import "server-only";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getPublicSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}