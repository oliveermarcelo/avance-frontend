import { requireInstructor } from '@/lib/auth/instructor'
import { getInstructorAnalytics } from '@/lib/data/instructor-analytics'
import {
  MonthlyEnrollmentsChart,
  CompletionRateChart,
  RevenueChart,
  AvgProgressChart
} from '@/components/instructor/instructor-analytics-charts'
import { Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

export default async function InstructorAnalyticsPage() {
  const user = await requireInstructor()
  const data = await getInstructorAnalytics(user.id)

  const kpis = [
    { label: 'Alunos unicos', value: data.totalStudents.toString(), icon: Users, sub: 'em todos os cursos' },
    { label: 'Conclusao media', value: `${data.avgCompletionRate}%`, icon: TrendingUp, sub: 'taxa de conclusao' },
    {
      label: 'Receita total',
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      sub: 'pagamentos confirmados'
    },
    { label: 'Progresso medio', value: `${data.avgProgress}%`, icon: BarChart3, sub: 'media de todos os alunos' }
  ]

  const totalRecent = data.monthlyEnrollments.reduce((s, m) => s + m.count, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Desempenho e engajamento dos seus cursos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#1F3A2D18' }}>
                  <Icon size={16} style={{ color: '#1F3A2D' }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-400">{kpi.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Linha 2: gráfico barras (2/3) + conclusao (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-800">Matriculas — ultimos 6 meses</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
              {totalRecent} no periodo
            </span>
          </div>
          <MonthlyEnrollmentsChart data={data.monthlyEnrollments} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Taxa de conclusao</h2>
          <CompletionRateChart data={data.courseStats} />
        </div>
      </div>

      {/* Linha 3: receita + progresso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Receita por curso</h2>
          <RevenueChart data={data.courseStats} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Progresso medio por curso</h2>
          <AvgProgressChart data={data.courseStats} />
        </div>
      </div>
    </div>
  )
}