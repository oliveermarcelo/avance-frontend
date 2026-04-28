import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });

  const videos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  ];

  let updated = 0;
  for (let i = 0; i < lessons.length; i++) {
    if (!lessons[i].videoUrl) {
      await prisma.lesson.update({
        where: { id: lessons[i].id },
        data: { videoUrl: videos[i % videos.length] },
      });
      updated++;
    }
  }

  console.log(`Atualizadas ${updated} aulas (de ${lessons.length} no total)`);
}

main().finally(() => prisma.$disconnect());