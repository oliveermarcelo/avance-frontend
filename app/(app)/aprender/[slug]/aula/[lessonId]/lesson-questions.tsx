"use client";

import { useState, useTransition } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  askLessonQuestionAction,
  replyToLessonQuestionAction,
} from "./actions";

export interface QuestionUser {
  id: string;
  name: string | null;
}

export interface SerializedAnswer {
  id: string;
  questionId: string;
  userId: string;
  user: QuestionUser;
  body: string;
  isInstructor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedQuestion {
  id: string;
  courseId: string;
  lessonId: string | null;
  userId: string;
  user: QuestionUser;
  title: string;
  body: string;
  isResolved: boolean;
  answers: SerializedAnswer[];
  createdAt: string;
  updatedAt: string;
}

interface LessonQuestionsProps {
  questions: SerializedQuestion[];
  lessonId: string;
  courseId: string;
  slug: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}m`;
}

export function LessonQuestions({
  questions,
  lessonId,
  courseId,
  slug,
}: LessonQuestionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const handleAsk = () => {
    if (!title.trim() || !body.trim()) return;
    startTransition(async () => {
      const res = await askLessonQuestionAction({
        courseId,
        lessonId,
        title,
        body,
        slug,
      });
      if (res.ok) {
        setTitle("");
        setBody("");
        setShowForm(false);
      }
    });
  };

  const handleReply = (questionId: string) => {
    if (!replyBody.trim()) return;
    startTransition(async () => {
      const res = await replyToLessonQuestionAction({
        questionId,
        body: replyBody,
        slug,
        lessonId,
      });
      if (res.ok) {
        setReplyBody("");
        setReplyingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-primary">Perguntas</h3>
          <span className="text-xs text-muted-foreground">
            ({questions.length})
          </span>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            Fazer pergunta
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo da pergunta"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Descreva sua duvida..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setBody("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAsk}
              disabled={isPending || !title.trim() || !body.trim()}
            >
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      )}

      {questions.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          Nenhuma pergunta nessa aula ainda. Seja o primeiro!
        </p>
      )}

      {questions.length > 0 && (
        <ul className="space-y-3">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <li
                key={q.id}
                className="rounded-lg border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {q.title}
                      </span>
                      {q.isResolved && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Resolvida
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {q.user.name ?? "Aluno"} - {timeAgo(q.createdAt)}
                      {q.answers.length > 0 &&
                        ` - ${q.answers.length} resposta${q.answers.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                      {q.body}
                    </p>

                    {q.answers.length > 0 && (
                      <ul className="space-y-2 border-l-2 border-accent/20 pl-3">
                        {q.answers.map((a) => (
                          <li key={a.id} className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {a.user.name ?? "Usuario"}
                              {a.isInstructor && (
                                <span className="ml-1 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                                  Instrutor
                                </span>
                              )}
                              <span className="ml-1 font-normal">
                                - {timeAgo(a.createdAt)}
                              </span>
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                              {a.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {replyingId === q.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder="Sua resposta..."
                          rows={2}
                          className="w-full resize-none rounded-lg border border-border bg-background p-2 text-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyBody("");
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReply(q.id)}
                            disabled={isPending || !replyBody.trim()}
                          >
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Enviar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingId(q.id)}
                        className="text-xs"
                      >
                        Responder
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}