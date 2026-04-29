import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tint?: "blue" | "emerald" | "amber" | "violet" | "slate";
}

const tintStyles = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  tint = "slate",
}: KpiCardProps) {
  const hasDelta = delta !== undefined;
  const isPositive = hasDelta && delta > 0;
  const isNegative = hasDelta && delta < 0;
  const isZero = hasDelta && delta === 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            tintStyles[tint]
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

      {hasDelta && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
              isPositive && "bg-emerald-50 text-emerald-700",
              isNegative && "bg-red-50 text-red-700",
              isZero && "bg-slate-100 text-slate-600"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {isPositive && "+"}
            {delta}%
          </span>
          {deltaLabel && <span className="text-slate-500">{deltaLabel}</span>}
        </div>
      )}
    </article>
  );
}