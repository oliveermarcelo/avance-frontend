'use server'

import { requireInstructor } from '@/lib/auth/instructor'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function answerQuestionAction(questionId: string, body: string) {
  const user = await requireInstructor()
  if (!body.trim()) return { error: 'Resposta nao pode ser vazia.' }

  const question = await db.question.findFirst({
    where: { id: questionId, course: { instructorId: user.id } }
  })
  if (!question) return { error: 'Pergunta nao encontrada.' }

  await db.answer.create({
    data: { questionId, userId: user.id, body: body.trim(), isInstructor: true }
  })

  revalidatePath(`/instrutor/perguntas/${questionId}`)
  revalidatePath('/instrutor/perguntas')
  return { success: true }
}

export async function toggleResolvedAction(questionId: string, current: boolean) {
  const user = await requireInstructor()

  const question = await db.question.findFirst({
    where: { id: questionId, course: { instructorId: user.id } }
  })
  if (!question) return { error: 'Pergunta nao encontrada.' }

  await db.question.update({
    where: { id: questionId },
    data: { isResolved: !current }
  })

  revalidatePath(`/instrutor/perguntas/${questionId}`)
  revalidatePath('/instrutor/perguntas')
  return { success: true }
}