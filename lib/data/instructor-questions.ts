import { db } from '@/lib/db'

export interface QuestionListItem {
  id: string
  title: string
  body: string
  isResolved: boolean
  courseTitle: string
  courseId: string
  lessonTitle: string | null
  studentName: string
  studentAvatar: string | null
  answerCount: number
  createdAt: string
}

export interface QuestionDetail {
  id: string
  title: string
  body: string
  isResolved: boolean
  courseTitle: string
  lessonTitle: string | null
  studentName: string
  studentAvatar: string | null
  createdAt: string
  answers: {
    id: string
    body: string
    isInstructor: boolean
    authorName: string
    authorAvatar: string | null
    createdAt: string
  }[]
}

export async function getInstructorQuestions(
  instructorId: string,
  opts: { status?: string; courseId?: string }
): Promise<QuestionListItem[]> {
  const courses = await db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true }
  })
  const courseIds = courses.map(c => c.id)
  if (courseIds.length === 0) return []

  const where: Record<string, unknown> = { courseId: { in: courseIds } }
  if (opts.status === 'pending') where.isResolved = false
  if (opts.status === 'resolved') where.isResolved = true
  if (opts.courseId) where.courseId = opts.courseId

  const questions = await db.question.findMany({
    where,
    include: {
      course: { select: { title: true } },
      lesson: { select: { title: true } },
      user: { select: { name: true, avatar: true } },
      answers: { select: { id: true } }
    },
    orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }]
  })

  return questions.map(q => ({
    id: q.id,
    title: q.title,
    body: q.body,
    isResolved: q.isResolved,
    courseTitle: q.course.title,
    courseId: q.courseId,
    lessonTitle: q.lesson?.title ?? null,
    studentName: q.user.name,
    studentAvatar: q.user.avatar ?? null,
    answerCount: q.answers.length,
    createdAt: q.createdAt.toISOString()
  }))
}

export async function getInstructorQuestionDetail(
  questionId: string,
  instructorId: string
): Promise<QuestionDetail | null> {
  const q = await db.question.findFirst({
    where: {
      id: questionId,
      course: { instructorId }
    },
    include: {
      course: { select: { title: true } },
      lesson: { select: { title: true } },
      user: { select: { name: true, avatar: true } },
      answers: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
  if (!q) return null

  return {
    id: q.id,
    title: q.title,
    body: q.body,
    isResolved: q.isResolved,
    courseTitle: q.course.title,
    lessonTitle: q.lesson?.title ?? null,
    studentName: q.user.name,
    studentAvatar: q.user.avatar ?? null,
    createdAt: q.createdAt.toISOString(),
    answers: q.answers.map(a => ({
      id: a.id,
      body: a.body,
      isInstructor: a.isInstructor,
      authorName: a.user.name,
      authorAvatar: a.user.avatar ?? null,
      createdAt: a.createdAt.toISOString()
    }))
  }
}

export async function getInstructorCourseOptions(instructorId: string) {
  return db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })
}