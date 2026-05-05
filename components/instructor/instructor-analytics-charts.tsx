'use client'

import type { MonthlyEnrollment, CourseAnalytics } from '@/lib/data/instructor-analytics'

const VERDE = '#1F3A2D'
const AZUL = '#1E5A8C'

function niceMax(v: number): number {
  if (v <= 0) return 5
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const frac = v / exp
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10
  return nice * exp
}

export function MonthlyEnrollmentsChart({ data }: { data: MonthlyEnrollment[] }) {
  const rawMax = Math.max(...data.map(d => d.count), 1)
  const max = niceMax(rawMax)
  const H = 140
  const barW = 28
  const gap = 18
  const totalW = data.length * (barW + gap) - gap
  const offsetX = 36
  const svgW = totalW + offsetX + 16

  const steps = 4
  const gridLines = Array.from({ length: steps + 1 }, (_, i) => ({
    i,
    v: Math.round((max / steps) * i),
    y: 12 + H * (1 - i / steps)
  }))

  return (
    <svg viewBox={`0 0 ${svgW} 195`} className="w-full h-auto">
      {gridLines.map(({ i, v, y }) => (
        <g key={i}>
          <line x1={offsetX} x2={offsetX + totalW} y1={y} y2={y}
            stroke={i === 0 ? '#d1d5db' : '#f3f4f6'}
            strokeWidth={i === 0 ? 1.5 : 1} />
          <text x={offsetX - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = d.count === 0 ? 2 : (d.count / max) * H
        const x = offsetX + i * (barW + gap)
        const y = 12 + H - barH
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 2)}
              fill={AZUL} rx={3} opacity={0.85} />
            {d.count > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                fontSize="10" fontWeight="700" fill={AZUL}>{d.count}</text>
            )}
            <text x={x + barW / 2} y={175} textAnchor="middle" fontSize="11" fill="#9ca3af">
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function HBar({ label, value, max, display, color }: {
  label: string; value: number; max: number; display: string; color: string
}) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-28 shrink-0 text-xs text-gray-600 truncate" title={label}>{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-16 text-right text-xs font-semibold text-gray-700 shrink-0">{display}</div>
    </div>
  )
}

export function CompletionRateChart({ data }: { data: CourseAnalytics[] }) {
  return (
    <div className="space-y-3.5">
      {data.length === 0 && <p className="text-sm text-gray-400">Nenhum dado disponivel.</p>}
      {data.map(c => (
        <HBar key={c.id} label={c.title} value={c.completionRate} max={100}
          display={`${c.completionRate}%`} color={VERDE} />
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: CourseAnalytics[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="space-y-3.5">
      {data.length === 0 && <p className="text-sm text-gray-400">Nenhum dado disponivel.</p>}
      {data.map(c => (
        <HBar key={c.id} label={c.title} value={c.revenue} max={max}
          display={`R$ ${c.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color={AZUL} />
      ))}
    </div>
  )
}

export function AvgProgressChart({ data }: { data: CourseAnalytics[] }) {
  return (
    <div className="space-y-3.5">
      {data.length === 0 && <p className="text-sm text-gray-400">Nenhum dado disponivel.</p>}
      {data.map(c => (
        <div key={c.id} className="flex items-center gap-2.5">
          <div className="w-28 shrink-0 text-xs text-gray-600 truncate" title={c.title}>{c.title}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${c.avgProgress}%`, backgroundColor: AZUL }} />
          </div>
          <div className="w-8 text-right text-xs font-semibold text-gray-700 shrink-0">{c.avgProgress}%</div>
          <div className="w-14 text-right text-xs text-gray-400 shrink-0">
            {c.enrollments} {c.enrollments === 1 ? 'aluno' : 'alunos'}
          </div>
        </div>
      ))}
    </div>
  )
}