import { PrismaClient, PaymentStatus, PaymentGateway } from "@prisma/client";

const prisma = new PrismaClient();

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randomBetween(8, 22), randomBetween(0, 59), 0, 0);
  return d;
}

async function main() {
  console.log("Limpando pagamentos antigos...");
  await prisma.payment.deleteMany();

  const courses = await prisma.course.findMany({
    where: { isPublished: true, deletedAt: null },
    select: { id: true, price: true, slug: true },
  });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: { id: true },
  });

  if (courses.length === 0 || students.length === 0) {
    console.log("Sem cursos publicados ou alunos. Publique alguns cursos antes.");
    return;
  }

  const gateways: PaymentGateway[] = ["ASAAS", "MERCADO_PAGO", "STRIPE"];
  const payments = [];

  for (let i = 0; i < 35; i++) {
    const course = courses[Math.floor(Math.random() * courses.length)];
    const student = students[Math.floor(Math.random() * students.length)];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];

    const day = randomBetween(0, 29);
    const createdAt = daysAgo(day);

    const random = Math.random();
    let status: PaymentStatus;
    let paidAt: Date | null = null;

    if (random < 0.78) {
      status = "PAID";
      paidAt = new Date(createdAt.getTime() + randomBetween(60, 3600) * 1000);
    } else if (random < 0.92) {
      status = "PENDING";
    } else if (random < 0.97) {
      status = "FAILED";
    } else {
      status = "REFUNDED";
      paidAt = createdAt;
    }

    payments.push({
      userId: student.id,
      courseId: course.id,
      amount: course.price,
      status,
      gateway,
      transactionId: `tx_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
      paidAt,
      createdAt,
      updatedAt: createdAt,
    });
  }

  for (const p of payments) {
    await prisma.payment.create({ data: p });
  }

  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.status === "PAID").length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    refunded: payments.filter((p) => p.status === "REFUNDED").length,
  };

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  console.log(`\n${stats.total} pagamentos criados:`);
  console.log(`  PAID:     ${stats.paid}`);
  console.log(`  PENDING:  ${stats.pending}`);
  console.log(`  FAILED:   ${stats.failed}`);
  console.log(`  REFUNDED: ${stats.refunded}`);
  console.log(`\nReceita total (PAID): R$ ${totalRevenue.toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });