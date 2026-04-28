import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = "https://www.w3schools.com/html/mov_bbb.mp4";
  const all = await prisma.lesson.findMany({ select: { id: true } });
  for (const lesson of all) {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoUrl: url },
    });
  }
  console.log(`${all.length} aulas atualizadas com Big Buck Bunny`);
}

main().finally(() => prisma.$disconnect());