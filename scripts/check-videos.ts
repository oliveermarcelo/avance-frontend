import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lesson = await prisma.lesson.findUnique({
    where: { id: "cmohq7k470009ufzcqu3udehj" },
    select: { id: true, title: true, videoUrl: true },
  });
  console.log(JSON.stringify(lesson, null, 2));

  const allLessons = await prisma.lesson.findMany({
    select: { id: true, title: true, videoUrl: true },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });
  const withVideo = allLessons.filter((l) => l.videoUrl).length;
  const without = allLessons.filter((l) => !l.videoUrl).length;
  console.log(`\nTotal: ${allLessons.length} aulas`);
  console.log(`Com video: ${withVideo}`);
  console.log(`Sem video: ${without}`);
}

main().finally(() => prisma.$disconnect());