import { requireInstructor } from '@/lib/auth/instructor'
import { getInstructorQuestionDetail } from '@/lib/data/instructor-questions'
import { answerQuestionAction, toggleResolvedAction } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, GraduationCap } from 'lucide-react'

function Avatar({ name, avatar, size = 9 }: { name: string; avatar: string | null; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
      style={{ backgroundColor: '#1E5A8C' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

async function ToggleResolvedButton({ id, isResolved }: { id: string; isResolved: boolean }) {
  return (
    <form action={async () => {
      'use server'
      await toggleResolvedAction(id, isResolved)
    }}>
      <button type="submit"
        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border font-medium transition ${
          isResolved
            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
        }`}>
        {isResolved ? <><Clock size={14} /> Reabrir</> : <><CheckCircle size={14} /> Marcar como resolvida</>}
      </button>
    </form>
  )
}

export default async function InstructorQuestionDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireInstructor()
  const { id } = await params
  const question = await getInstructorQuestionDetail(id, user.id)
  if (!question) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <Link href="/instrutor/perguntas"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft size={16} /> Voltar para perguntas
      </Link>

      {/* Header da pergunta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-bold text-gray-900 flex-1">{question.title}</h1>
          <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
            question.isResolved
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {question.isResolved ? <><CheckCircle size={11} /> Resolvida</> : <><Clock size={11} /> Pendente</>}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{question.studentName}</span>
          <span>·</span>
          <span>{question.courseTitle}</span>
          {question.lessonTitle && <><span>·</span><span>{question.lessonTitle}</span></>}
          <span>·</span>
          <span>{new Date(question.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{question.body}</p>

        <div className="pt-2">
          <ToggleResolvedButton id={question.id} isResolved={question.isResolved} />
        </div>
      </div>

      {/* Respostas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          {question.answers.length === 0
            ? 'Nenhuma resposta ainda'
            : `${question.answers.length} ${question.answers.length === 1 ? 'resposta' : 'respostas'}`}
        </h2>

        {question.answers.map(a => (
          <div key={a.id} className={`rounded-xl border p-5 space-y-3 ${
            a.isInstructor ? 'border-blue-100 bg-blue-50' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Avatar name={a.authorName} avatar={a.authorAvatar} size={8} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{a.authorName}</span>
                  {a.isInstructor && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium"
                      style={{ backgroundColor: '#1E5A8C15', color: '#1E5A8C', borderColor: '#1E5A8C40' }}>
                      <GraduationCap size={10} /> Instrutor
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
      </div>

      {/* Form de resposta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Sua resposta</h2>
        <form action={async (fd: FormData) => {
          'use server'
          const body = fd.get('body') as string
          await answerQuestionAction(question.id, body)
        }} className="space-y-4">
          <textarea name="body" rows={5} required
            placeholder="Digite sua resposta..."
            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400" />
          <button type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#1E5A8C' }}>
            Enviar resposta
          </button>
        </form>
      </div>
    </div>
  )
}