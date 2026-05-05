"use client";

import { useState } from "react";
import { StickyNote, MessageCircle } from "lucide-react";
import { LessonNotes } from "@/components/avance/lesson-notes";
import {
  LessonQuestions,
  type SerializedQuestion,
} from "./lesson-questions";
import { cn } from "@/lib/utils";

interface LessonTabsProps {
  notes: any[];
  lessonId: string;
  slug: string;
  courseId: string;
  questions: SerializedQuestion[];
  getCurrentTimestamp: () => number | null;
}

type Tab = "notes" | "questions";

export function LessonTabs({
  notes,
  lessonId,
  slug,
  courseId,
  questions,
  getCurrentTimestamp,
}: LessonTabsProps) {
  const [tab, setTab] = useState<Tab>("notes");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setTab("notes")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
            tab === "notes"
              ? "bg-accent text-white shadow-sm"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Notas
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              tab === "notes"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {notes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("questions")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
            tab === "questions"
              ? "bg-accent text-white shadow-sm"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Perguntas
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              tab === "questions"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {questions.length}
          </span>
        </button>
      </div>

      <div className={tab === "notes" ? "" : "hidden"}>
        <LessonNotes
          notes={notes}
          lessonId={lessonId}
          slug={slug}
          getCurrentTimestamp={getCurrentTimestamp}
        />
      </div>

      <div className={tab === "questions" ? "" : "hidden"}>
        <LessonQuestions
          questions={questions}
          lessonId={lessonId}
          courseId={courseId}
          slug={slug}
        />
      </div>
    </div>
  );
}