"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface RevenuePoint {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso + "T12:00:00"));
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

  const chartHeight = 200;
  const chartWidth = 100;
  const barWidth = chartWidth / data.length;
  const padding = 0.15;

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Receita dos ultimos 30 dias
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </h2>
        </div>

        {hovered && (
          <div className="rounded-md bg-slate-900 px-3 py-1.5 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {formatDate(hovered.date)}
            </p>
            <p className="text-sm font-bold text-white">
              {formatCurrency(hovered.amount)}
            </p>
          </div>
        )}

        {!hovered && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Passe o mouse nas barras</span>
          </div>
        )}
      </header>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="h-48 w-full"
        >
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1="0"
              y1={chartHeight * p}
              x2={chartWidth}
              y2={chartHeight * p}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-slate-200"
              strokeDasharray="0.5 0.5"
            />
          ))}

          {data.map((point, idx) => {
            const barHeight = (point.amount / maxAmount) * (chartHeight - 8);
            const x = idx * barWidth + barWidth * padding;
            const w = barWidth * (1 - 2 * padding);
            const y = chartHeight - barHeight;
            const isHovered = hoveredIndex === idx;

            return (
              <g key={point.date}>
                <rect
                  x={idx * barWidth}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                />
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barHeight}
                  rx="0.5"
                  className={
                    isHovered
                      ? "fill-slate-900 transition-colors"
                      : point.amount > 0
                      ? "fill-slate-700 transition-colors"
                      : "fill-slate-200 transition-colors"
                  }
                  style={{ pointerEvents: "none" }}
                />
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
          <span>{formatDate(data[0].date)}</span>
          {data.length > 14 && (
            <span>
              {formatDate(data[Math.floor(data.length / 2)].date)}
            </span>
          )}
          <span>{formatDate(data[data.length - 1].date)}</span>
        </div>
      </div>
    </article>
  );
}