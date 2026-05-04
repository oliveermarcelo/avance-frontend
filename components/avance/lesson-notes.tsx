"use client";

import { useState, useTransition } from "react";
import { StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  saveLessonNoteAction,
  deleteLessonNoteAction,
} from "@/app/(app)/aprender/[slug]/aula/[lessonId]/actions";

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: Date;
}

interface LessonNotesProps {
  notes: Note[];
  lessonId: string;
  slug: string;
  getCurrentTimestamp?: () => number | null;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LessonNotes({ notes, lessonId, slug, getCurrentTimestamp }: LessonNotesProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      const ts = getCurrentTimestamp?.() ?? null;
      const res = await saveLessonNoteAction({
        lessonId,
        content,
        timestamp: ts,
        slug,
      });
      if (res.ok) setContent("");
    });
  };

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      await deleteLessonNoteAction({ noteId, slug, lessonId });
    });
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-bold text-primary">Suas notas</h3>
        <span className="text-xs text-muted-foreground">({notes.length})</span>
      </header>

      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva uma nota sobre essa aula..."
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm shadow-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending || !content.trim()}
            size="sm"
          >
            {isPending ? "Salvando..." : "Salvar nota"}
          </Button>
        </div>
      </div>

      {notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                {note.timestamp !== null && (
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {formatTimestamp(note.timestamp)}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(note.id)}
                  className="ml-auto text-muted-foreground transition hover:text-destructive"
                  aria-label="Excluir nota"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}