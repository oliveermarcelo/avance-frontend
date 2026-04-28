"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, Lock, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface CourseOutlineProps {
  modules: Module[];
  isEnrolled: boolean;
  watchedLessons?: Set<string>;
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function CourseOutline({ modules, isEnrolled, watchedLessons }: CourseOutlineProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(modules.length > 0 ? [modules[0].id] : [])
  );

  const toggle = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalSeconds = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {modules.length} módulos · {totalLessons} aulas
        </span>
        <span>{formatDuration(totalSeconds)}</span>
      </div>

      <div className="space-y-2">
        {modules.map((module, idx) => {
          const isOpen = openModules.has(module.id);
          const moduleSeconds = module.lessons.reduce((s, l) => s + l.duration, 0);

          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => toggle(module.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-primary truncate">{module.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {module.lessons.length} aulas · {formatDuration(moduleSeconds)}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <ul className="border-t border-border divide-y divide-border">
                  {module.lessons.map((lesson) => {
                    const isWatched = watchedLessons?.has(lesson.id) ?? false;
                    const canAccess = isEnrolled || lesson.isFree;

                    return (
                      <li
                        key={lesson.id}
                        className={cn(
                          "flex items-center gap-3 px-5 py-3 text-sm",
                          canAccess
                            ? "hover:bg-muted/20"
                            : "opacity-60"
                        )}
                      >
                        {isWatched ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                        ) : canAccess ? (
                          <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}

                        <span className="flex-1 truncate">{lesson.title}</span>

                        {lesson.isFree && !isEnrolled && (
                          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
                            Grátis
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(lesson.duration)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}