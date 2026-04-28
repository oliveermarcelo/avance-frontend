import "server-only";
import { db } from "@/lib/db";

export async function getUserCertificates(userId: string) {
  return db.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    include: {
      enrollment: {
        include: {
          course: {
            select: { title: true, slug: true, totalDuration: true },
          },
        },
      },
    },
  });
}