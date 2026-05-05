import { notFound, redirect } from "next/navigation";
import { LessonContent } from "./lesson-content";
import { getCurrentUser } from "@/lib/data/user";
import { getLessonContext } from "@/lib/data/lesson";
import { db } from "@/lib/db";

export default async function AulaPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ctx = await getLessonContext(slug, lessonId, user.id);
  if (!ctx) notFound();

  if (!ctx.enrollment && !ctx.lesson.isFree) {
    redirect(`/aprender/${slug}`);
  }

  const questions = await db.question.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      answers: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  const serializedQuestions = questions.map((q) => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    answers: q.answers.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  }));

  return (
    <LessonContent
      ctx={{ ...ctx, questions: serializedQuestions }}
      slug={slug}
    />
  );
}

export const dynamic = "force-dynamic";