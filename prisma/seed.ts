import { PrismaClient, UserRole, CourseLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  await prisma.lessonProgress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.courseReview.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Tabelas limpas");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const instructorPassword = await bcrypt.hash("instrutor123", 10);
  const studentPassword = await bcrypt.hash("aluno123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@avance.com.br",
      password: adminPassword,
      name: "Administrador Avance",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: "dr.silva@avance.com.br",
      password: instructorPassword,
      name: "Dr. Roberto Silva",
      crm: "CRM 12345",
      phone: "(75) 99999-1234",
      bio: "Especialista em harmonização facial e procedimentos estéticos avançados. Mais de 15 anos de experiência clínica.",
      role: UserRole.INSTRUCTOR,
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "aluno@avance.com.br",
      password: studentPassword,
      name: "Dr. João Silva",
      crm: "CRM 123456",
      phone: "(75) 99999-5678",
      role: UserRole.STUDENT,
      emailVerified: new Date(),
    },
  });

  console.log("Usuarios criados");

  const cats = await Promise.all([
    prisma.category.create({
      data: {
        slug: "estetica",
        name: "Estética",
        description: "Procedimentos estéticos e harmonização facial",
        color: "#C9A227",
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        slug: "clinica",
        name: "Clínica",
        description: "Gestão de consultório e clínica médica",
        color: "#1F3A2D",
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        slug: "procedimentos",
        name: "Procedimentos",
        description: "Técnicas e procedimentos médicos",
        color: "#2D503E",
        order: 3,
      },
    }),
  ]);

  console.log("Categorias criadas");

  const curso1 = await prisma.course.create({
    data: {
      slug: "harmonizacao-facial-avancada",
      title: "Harmonização Facial Avançada",
      shortDescription: "Domine as técnicas mais modernas de harmonização facial com abordagem científica e segura.",
      description: "Curso completo abordando avaliação facial, técnicas de preenchimento, toxina botulínica, fios de sustentação e bioestimuladores. Inclui módulo de marketing para sua clínica.",
      categoryId: cats[0].id,
      instructorId: instructor.id,
      level: CourseLevel.ADVANCED,
      price: 4997,
      isPremium: true,
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: "Fundamentos da Harmonização",
            order: 1,
            lessons: {
              create: [
                { title: "Boas-vindas ao curso", duration: 480, order: 1, isFree: true },
                { title: "Anatomia facial aplicada", duration: 1800, order: 2 },
                { title: "Avaliação do paciente", duration: 2100, order: 3 },
                { title: "Planejamento do tratamento", duration: 1500, order: 4 },
              ],
            },
          },
          {
            title: "Toxina Botulínica",
            order: 2,
            lessons: {
              create: [
                { title: "Mecanismo de ação", duration: 1200, order: 1 },
                { title: "Pontos de aplicação - terço superior", duration: 2400, order: 2 },
                { title: "Pontos de aplicação - terço médio e inferior", duration: 2400, order: 3 },
                { title: "Manejo de complicações", duration: 1800, order: 4 },
              ],
            },
          },
          {
            title: "Preenchedores",
            order: 3,
            lessons: {
              create: [
                { title: "Tipos de ácido hialurônico", duration: 1500, order: 1 },
                { title: "Técnicas de aplicação", duration: 2700, order: 2 },
                { title: "Volumização e contorno", duration: 2400, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  const curso2 = await prisma.course.create({
    data: {
      slug: "gestao-consultorio-medico",
      title: "Gestão de Consultório Médico",
      shortDescription: "Aprenda a gerenciar sua clínica de forma profissional, do financeiro ao marketing digital.",
      description: "Estrutura completa para médicos que querem profissionalizar sua clínica. Inclui gestão financeira, jurídica, marketing e atendimento.",
      categoryId: cats[1].id,
      instructorId: instructor.id,
      level: CourseLevel.INTERMEDIATE,
      price: 1997,
      isPublished: true,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: "Estrutura jurídica",
            order: 1,
            lessons: {
              create: [
                { title: "PJ vs PF - como decidir", duration: 1500, order: 1, isFree: true },
                { title: "Tipos societários", duration: 1800, order: 2 },
                { title: "Documentação necessária", duration: 1200, order: 3 },
              ],
            },
          },
          {
            title: "Gestão financeira",
            order: 2,
            lessons: {
              create: [
                { title: "Precificação de procedimentos", duration: 2100, order: 1 },
                { title: "Fluxo de caixa", duration: 1800, order: 2 },
                { title: "Tributação inteligente", duration: 2400, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  const curso3 = await prisma.course.create({
    data: {
      slug: "toxina-botulinica-tecnicas-modernas",
      title: "Toxina Botulínica - Técnicas Modernas",
      shortDescription: "Atualize-se com as técnicas mais recentes em aplicação de toxina botulínica.",
      description: "Curso focado em técnicas avançadas de aplicação de toxina botulínica para resultados naturais e duradouros.",
      categoryId: cats[2].id,
      instructorId: instructor.id,
      level: CourseLevel.ADVANCED,
      price: 2497,
      isPremium: true,
      isPublished: true,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: "Técnicas modernas",
            order: 1,
            lessons: {
              create: [
                { title: "Microbotox", duration: 1800, order: 1, isFree: true },
                { title: "Mesobotox", duration: 1500, order: 2 },
                { title: "Aplicações off-label seguras", duration: 2100, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Cursos criados");

  const courses = [curso1, curso2, curso3];
  for (const course of courses) {
    const lessons = await prisma.lesson.findMany({
      where: { module: { courseId: course.id } },
    });
    const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
    await prisma.course.update({
      where: { id: course.id },
      data: {
        totalLessons: lessons.length,
        totalDuration,
      },
    });
  }

  console.log("Estatisticas de cursos atualizadas");

  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: curso1.id,
      progress: 68,
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      lastAccessAt: new Date(),
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: curso2.id,
      progress: 12,
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastAccessAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: curso3.id,
      progress: 0,
      enrolledAt: new Date(),
    },
  });

  console.log("Matriculas criadas");

  const lessonsCurso1 = await prisma.lesson.findMany({
    where: { module: { courseId: curso1.id } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });

  for (let i = 0; i < Math.floor(lessonsCurso1.length * 0.68); i++) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollment1.id,
        lessonId: lessonsCurso1[i].id,
        userId: student.id,
        watched: true,
        watchedSeconds: lessonsCurso1[i].duration,
        watchedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Progresso de aulas criado");

  await prisma.courseReview.createMany({
    data: [
      {
        userId: student.id,
        courseId: curso1.id,
        rating: 5,
        comment: "Curso excepcional! O Dr. Roberto domina o assunto e a didática é impecável.",
      },
    ],
  });

  console.log("Reviews criadas");

  console.log("\nSeed concluido com sucesso!");
  console.log("\nUsuarios disponiveis:");
  console.log("  ADMIN:      admin@avance.com.br        / admin123");
  console.log("  INSTRUCTOR: dr.silva@avance.com.br     / instrutor123");
  console.log("  STUDENT:    aluno@avance.com.br        / aluno123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });