import { requireInstructor } from '@/lib/auth/instructor'
import { getInstructorFinanceiro } from '@/lib/data/instructor-financeiro'
import { DollarSign, TrendingUp, ShoppingCart, Receipt } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  Pago: 'bg-green-50 text-green-700 border-green-200',
  Pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Falhou: 'bg-red-50 text-red-700 border-red-200',
  Estornado: 'bg-gray-100 text-gray-600 border-gray-200'
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatBRL(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function InstructorFinanceiroPage() {
  const user = await requireInstructor()
  const data = await getInstructorFinanceiro(user.id)

  const kpis = [
    { label: 'Receita total', value: formatBRL(data.totalRevenue), icon: DollarSign, sub: 'pagamentos confirmados' },
    { label: 'Receita do mes', value: formatBRL(data.monthRevenue), icon: TrendingUp, sub: 'mes atual' },
    { label: 'Ticket medio', value: formatBRL(data.avgTicket), icon: Receipt, sub: 'por venda confirmada' },
    { label: 'Total de vendas', value: data.totalSales.toString(), icon: ShoppingCart, sub: 'pagamentos pagos' }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Receita e historico de pagamentos dos seus cursos</p>
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

      {/* Layout: tabela (2/3) + resumo por curso (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Tabela de pagamentos */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Ultimos pagamentos</h2>
          </div>
          {data.payments.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">Nenhum pagamento encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-medium">Aluno</th>
                    <th className="px-4 py-3 text-left font-medium">Curso</th>
                    <th className="px-4 py-3 text-left font-medium">Metodo</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 truncate max-w-[140px]">{p.studentName}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[140px]">{p.studentEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[140px]">{p.courseTitle}</td>
                      <td className="px-4 py-3 text-gray-500">{p.method}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatBRL(p.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">
                        {formatDate(p.paidAt ?? p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receita por curso */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Receita por curso</h2>
          {data.byCourse.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum dado disponivel.</p>
          ) : (
            <div className="space-y-4">
              {data.byCourse.map((c, i) => {
                const maxRevenue = data.byCourse[0]?.revenue ?? 1
                const pct = maxRevenue === 0 ? 0 : Math.min((c.revenue / maxRevenue) * 100, 100)
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate max-w-[160px]" title={c.title}>
                        {i + 1}. {c.title}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 shrink-0 ml-2">
                        {c.sales} venda{c.sales !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: '#1E5A8C' }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 shrink-0 w-20 text-right">
                        {formatBRL(c.revenue)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}