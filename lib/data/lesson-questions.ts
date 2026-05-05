import { db } from "@/lib/db";

export interface LessonAnswer {
  id: string;
  body: string;
  isInstructor: boolean;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

export interface LessonQuestion {
  id: string;
  title: string;
  body: string;
  isResolved: boolean;
  authorName: string;
  authorAvatar: string | null;
  isMine: boolean;
  createdAt: string;
  answers: LessonAnswer[];
}

export async function getLessonQuestions(
  lessonId: string,
  currentUserId: string
): Promise<LessonQuestion[]> {
  const questions = await db.question.findMany({
    where: { lessonId },
    include: {
      user: { select: { name: true, avatar: true } },
      answers: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return questions.map((q) => ({
    id: q.id,
    title: q.title,
    body: q.body,
    isResolved: q.isResolved,
    authorName: q.user.name,
    authorAvatar: q.user.avatar,
    isMine: q.userId === currentUserId,
    createdAt: q.createdAt.toISOString(),
    answers: q.answers.map((a) => ({
      id: a.id,
      body: a.body,
      isInstructor: a.isInstructor,
      authorName: a.user.name,
      authorAvatar: a.user.avatar,
      createdAt: a.createdAt.toISOString(),
    })),
  }));
}