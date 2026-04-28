"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronDown, Lock, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLesson {
  id: string;
  title: string;
  duration: number;
  isFree: boolean;
}

interface SidebarModule {
  id: string;
  title: string;
  order: number;
  lessons: SidebarLesson[];
}

interface LessonSidebarProps {
  courseTitle: string;
  courseSlug: string;
  modules: SidebarModule[];
  currentLessonId: string;
  watchedLessonIds: Set<string>;
  isEnrolled: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}min` : `${h}h`;
}

export function LessonSidebar({
  courseTitle,
  courseSlug,
  modules,
  currentLessonId,
  watchedLessonIds,
  isEnrolled,
  isOpen,
  onClose,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const current = modules.find((m) => m.lessons.some((l) => l.id === currentLessonId));
    return new Set(current ? [current.id] : []);
  });

  const toggle = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const watchedCount = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => watchedLessonIds.has(l.id)).length,
    0
  );
  const progress = totalLessons > 0 ? (watchedCount / totalLessons) * 100 : 0;

  if (!isOpen) return null;

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-card lg:w-96">
      <header className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div className="min-w-0 space-y-2">
          <Link
            href={`/curso/${courseSlug}`}
            className="text-[10px] font-semibold uppercase tracking-widest text-accent hover:underline"
          >
            Voltar ao curso
          </Link>
          <h2 className="truncate text-sm font-bold text-primary">{courseTitle}</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                {watchedCount} de {totalLessons} aulas
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {modules.map((module, idx) => {
          const isOpenModule = openModules.has(module.id);
          const moduleSeconds = module.lessons.reduce((s, l) => s + l.duration, 0);

          return (
            <div key={module.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggle(module.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-[10px] font-bold text-accent">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-primary">
                      {module.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {module.lessons.length} aulas · {formatDuration(moduleSeconds)}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpenModule && "rotate-180"
                  )}
                />
              </button>

              {isOpenModule && (
                <ul className="border-t border-border pb-2">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isWatched = watchedLessonIds.has(lesson.id);
                    const canAccess = isEnrolled || lesson.isFree;

                    const Icon = isWatched
                      ? CheckCircle2
                      : canAccess
                      ? PlayCircle
                      : Lock;

                    if (!canAccess) {
                      return (
                        <li
                          key={lesson.id}
                          className="flex items-center gap-3 px-5 py-2.5 text-xs opacity-60"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate text-muted-foreground">
                            {lesson.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDuration(lesson.duration)}
                          </span>
                        </li>
                      );
                    }

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/curso/${courseSlug}/aula/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-3 px-5 py-2.5 text-xs transition",
                            isCurrent
                              ? "border-l-2 border-accent bg-accent/5 pl-[18px] font-semibold text-primary"
                              : "border-l-2 border-transparent text-foreground/85 hover:bg-muted/30"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isWatched ? "text-accent" : "text-muted-foreground"
                            )}
                          />
                          <span className="flex-1 truncate">{lesson.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDuration(lesson.duration)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}