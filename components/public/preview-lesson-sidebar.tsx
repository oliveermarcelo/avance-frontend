"use client";

import Link from "next/link";
import { PlayCircle, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewLessonSidebarProps {
  courseSlug: string;
  currentLessonId: string;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      duration: number;
      isFree: boolean;
      order: number;
    }>;
  }>;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}min` : `${h}h`;
}

export function PreviewLessonSidebar({
  courseSlug,
  currentLessonId,
  modules,
}: PreviewLessonSidebarProps) {
  return (
    <aside className="space-y-3">
      {modules.map((module, mIdx) => (
        <div
          key={module.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1F3A2D] text-[10px] font-bold text-white">
                {String(mIdx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1F3A2D]">
                  {module.title}
                </p>
                <p className="text-[10px] text-slate-500">
                  {module.lessons.length} aulas
                </p>
              </div>
            </div>
          </div>

          <ul>
            {module.lessons.map((lesson, lIdx) => {
              const isCurrent = lesson.id === currentLessonId;
              const isPreview = lesson.isFree;

              if (isPreview) {
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/curso/${courseSlug}/preview/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition last:border-b-0",
                        isCurrent
                          ? "bg-[#1F3A2D]/5"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <span className="text-[10px] font-bold text-slate-400 w-6">
                        {String(lIdx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          isCurrent
                            ? "bg-[#1F3A2D] text-white"
                            : "bg-emerald-50 text-emerald-600"
                        )}
                      >
                        {isCurrent ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <PlayCircle className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm",
                            isCurrent
                              ? "font-bold text-[#1F3A2D]"
                              : "text-slate-700"
                          )}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                      {!isCurrent && (
                        <span className="shrink-0 inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                          Preview
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 cursor-not-allowed"
                  title="Aula bloqueada - compre o curso para acessar"
                >
                  <span className="text-[10px] font-bold text-slate-400 w-6">
                    {String(lIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-400">
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {formatDuration(lesson.duration)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}