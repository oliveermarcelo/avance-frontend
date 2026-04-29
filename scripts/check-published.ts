import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const published = await prisma.course.count({ where: { isPublished: true, deletedAt: null } });
  const total = await prisma.course.count({ where: { deletedAt: null } });
  console.log(`Cursos: ${published} publicados de ${total} totais`);
}
main().finally(() => prisma.$disconnect());