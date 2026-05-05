import { requireInstructor } from '@/lib/auth/instructor'
import { getInstructorQuestions, getInstructorCourseOptions } from '@/lib/data/instructor-questions'
import Link from 'next/link'
import { MessageSquare, CheckCircle, Clock } from 'lucide-react'

function Avatar({ name, avatar, size = 8 }: { name: string; avatar: string | null; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}
      style={{ backgroundColor: '#1E5A8C' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default async function InstructorPerguntasPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; courseId?: string }>
}) {
  const user = await requireInstructor()
  const params = await searchParams
  const status = params.status ?? 'all'
  const courseId = params.courseId ?? ''

  const [questions, courses] = await Promise.all([
    getInstructorQuestions(user.id, { status, courseId }),
    getInstructorCourseOptions(user.id)
  ])

  const tabs = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'resolved', label: 'Respondidas' }
  ]

  function buildHref(newStatus: string) {
    const p = new URLSearchParams()
    if (newStatus !== 'all') p.set('status', newStatus)
    if (courseId) p.set('courseId', courseId)
    const qs = p.toString()
    return `/instrutor/perguntas${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perguntas</h1>
        <p className="text-sm text-gray-500 mt-1">Duvidas enviadas pelos seus alunos</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(t => (
            <Link key={t.key} href={buildHref(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                status === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/instrutor/perguntas" className="flex items-center gap-2">
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <select name="courseId" defaultValue={courseId}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos os cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button type="submit"
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
            Filtrar
          </button>
        </form>
      </div>

      {/* Lista */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma pergunta encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <Link key={q.id} href={`/instrutor/perguntas/${q.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition group">
              <div className="flex items-start gap-4">
                <Avatar name={q.studentName} avatar={q.studentAvatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition truncate">
                      {q.title}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                      q.isResolved
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {q.isResolved
                        ? <><CheckCircle size={10} /> Resolvida</>
                        : <><Clock size={10} /> Pendente</>}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {q.studentName} &middot; {q.courseTitle}
                    {q.lessonTitle ? ` — ${q.lessonTitle}` : ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{q.body}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MessageSquare size={11} /> {q.answerCount} {q.answerCount === 1 ? 'resposta' : 'respostas'}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}