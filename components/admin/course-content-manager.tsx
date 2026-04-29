"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  Lock,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleForm, LessonForm } from "./course-content-forms";
import {
  deleteModuleAction,
  deleteLessonAction,
  reorderModuleAction,
  reorderLessonAction,
} from "@/app/(admin)/admin/cursos/[id]/conteudo/actions";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
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

interface CourseContentManagerProps {
  courseId: string;
  modules: Module[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}min` : `${h}h`;
}

export function CourseContentManager({ courseId, modules }: CourseContentManagerProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [creatingLessonInModule, setCreatingLessonInModule] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!confirm("Excluir este modulo e todas as aulas dentro?")) return;
    const fd = new FormData();
    fd.append("moduleId", moduleId);
    startTransition(() => deleteModuleAction(fd));
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm("Excluir esta aula?")) return;
    const fd = new FormData();
    fd.append("lessonId", lessonId);
    startTransition(() => deleteLessonAction(fd));
  };

  const handleReorderModule = (moduleId: string, direction: "up" | "down") => {
    const fd = new FormData();
    fd.append("moduleId", moduleId);
    fd.append("direction", direction);
    startTransition(() => reorderModuleAction(fd));
  };

  const handleReorderLesson = (lessonId: string, direction: "up" | "down") => {
    const fd = new FormData();
    fd.append("lessonId", lessonId);
    fd.append("direction", direction);
    startTransition(() => reorderLessonAction(fd));
  };

  return (
    <div className="space-y-4">
      {modules.length === 0 && !creatingModule && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="text-base font-semibold text-slate-900">
            Nenhum modulo cadastrado
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Comece criando o primeiro modulo do curso.
          </p>
          <Button onClick={() => setCreatingModule(true)} className="mt-5">
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro modulo
          </Button>
        </div>
      )}

      {modules.map((module, idx) => {
        const isOpen = openModules.has(module.id);
        const isEditingThisModule = editingModule === module.id;
        const isCreatingLessonHere = creatingLessonInModule === module.id;
        const moduleSeconds = module.lessons.reduce((s, l) => s + l.duration, 0);

        if (isEditingThisModule) {
          return (
            <ModuleForm
              key={module.id}
              courseId={courseId}
              module={{
                id: module.id,
                title: module.title,
                description: module.description,
              }}
              onSuccess={() => setEditingModule(null)}
              onCancel={() => setEditingModule(null)}
            />
          );
        }

        return (
          <div
            key={module.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <button
                onClick={() => toggleModule(module.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {module.lessons.length} {module.lessons.length === 1 ? "aula" : "aulas"} ·{" "}
                    {formatDuration(moduleSeconds)}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReorderModule(module.id, "up")}
                  disabled={idx === 0 || isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Mover para cima"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleReorderModule(module.id, "down")}
                  disabled={idx === modules.length - 1 || isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Mover para baixo"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setEditingModule(module.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  title="Editar modulo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Excluir modulo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="bg-slate-50/50 p-3">
                {module.lessons.length === 0 && !isCreatingLessonHere && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
                    <p className="text-xs text-slate-500">
                      Nenhuma aula nesse modulo ainda.
                    </p>
                    <Button
                      onClick={() => setCreatingLessonInModule(module.id)}
                      size="sm"
                      variant="outline"
                      className="mt-3"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Adicionar primeira aula
                    </Button>
                  </div>
                )}

                {module.lessons.length > 0 && (
                  <ul className="space-y-1">
                    {module.lessons.map((lesson, lIdx) => {
                      const isEditingThisLesson = editingLesson === lesson.id;

                      if (isEditingThisLesson) {
                        return (
                          <li key={lesson.id}>
                            <LessonForm
                              moduleId={module.id}
                              lesson={lesson}
                              onSuccess={() => setEditingLesson(null)}
                              onCancel={() => setEditingLesson(null)}
                            />
                          </li>
                        );
                      }

                      return (
                        <li
                          key={lesson.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5"
                        >
                          <span className="text-[10px] font-bold text-slate-400 w-6">
                            {String(lIdx + 1).padStart(2, "0")}
                          </span>

                          {lesson.videoUrl ? (
                            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lesson.duration)}
                              </span>
                              {lesson.isFree && (
                                <span className="font-bold uppercase tracking-wider text-amber-600">
                                  Gratis
                                </span>
                              )}
                              {lesson.videoUrl && (
                                <span className="inline-flex items-center gap-1 truncate">
                                  <ExternalLink className="h-3 w-3" />
                                  Video
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReorderLesson(lesson.id, "up")}
                              disabled={lIdx === 0 || isPending}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleReorderLesson(lesson.id, "down")}
                              disabled={lIdx === module.lessons.length - 1 || isPending}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingLesson(lesson.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              disabled={isPending}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {isCreatingLessonHere ? (
                  <div className="mt-2">
                    <LessonForm
                      moduleId={module.id}
                      onSuccess={() => setCreatingLessonInModule(null)}
                      onCancel={() => setCreatingLessonInModule(null)}
                    />
                  </div>
                ) : module.lessons.length > 0 ? (
                  <Button
                    onClick={() => setCreatingLessonInModule(module.id)}
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full text-slate-600"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Adicionar aula
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {creatingModule ? (
        <ModuleForm
          courseId={courseId}
          onSuccess={() => setCreatingModule(false)}
          onCancel={() => setCreatingModule(false)}
        />
      ) : (
        modules.length > 0 && (
          <Button
            onClick={() => setCreatingModule(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar modulo
          </Button>
        )
      )}
    </div>
  );
}