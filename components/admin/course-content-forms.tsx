"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createModuleAction,
  updateModuleAction,
  createLessonAction,
  updateLessonAction,
  type ContentActionState,
} from "@/app/(admin)/admin/cursos/[id]/conteudo/actions";

interface ModuleFormProps {
  courseId: string;
  module?: {
    id: string;
    title: string;
    description: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ModuleForm({ courseId, module, onSuccess, onCancel }: ModuleFormProps) {
  const isEdit = !!module;
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ContentActionState | undefined>(undefined);

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      const action = isEdit ? updateModuleAction : createModuleAction;
      const result = await action(formData);
      setState(result);
      if (result?.ok) {
        onSuccess();
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {isEdit ? (
        <input type="hidden" name="moduleId" value={module.id} />
      ) : (
        <input type="hidden" name="courseId" value={courseId} />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          {isEdit ? "Editar modulo" : "Novo modulo"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-title">Titulo</Label>
        <Input
          id="module-title"
          name="title"
          defaultValue={module?.title ?? ""}
          placeholder="Ex: Fundamentos da Harmonizacao"
          required
          autoFocus
          disabled={isPending}
        />
        {state?.fieldErrors?.title && (
          <p className="text-xs text-red-600">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-description">Descricao (opcional)</Label>
        <textarea
          id="module-description"
          name="description"
          defaultValue={module?.description ?? ""}
          rows={2}
          placeholder="Sobre o que e esse modulo"
          disabled={isPending}
          className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {state?.message && !state.ok && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Salvar alteracoes" : "Criar modulo"}
        </Button>
      </div>
    </form>
  );
}

interface LessonFormProps {
  moduleId: string;
  lesson?: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    duration: number;
    isFree: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function LessonForm({ moduleId, lesson, onSuccess, onCancel }: LessonFormProps) {
  const isEdit = !!lesson;
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ContentActionState | undefined>(undefined);

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      const action = isEdit ? updateLessonAction : createLessonAction;
      const result = await action(formData);
      setState(result);
      if (result?.ok) {
        onSuccess();
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border-2 border-slate-300 bg-slate-50 p-5">
      {isEdit ? (
        <input type="hidden" name="lessonId" value={lesson.id} />
      ) : (
        <input type="hidden" name="moduleId" value={moduleId} />
      )}

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">
          {isEdit ? "Editar aula" : "Nova aula"}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-title">Titulo</Label>
        <Input
          id="lesson-title"
          name="title"
          defaultValue={lesson?.title ?? ""}
          placeholder="Ex: Boas-vindas ao curso"
          required
          autoFocus
          disabled={isPending}
        />
        {state?.fieldErrors?.title && (
          <p className="text-xs text-red-600">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lesson-videoUrl">URL do video</Label>
          <Input
            id="lesson-videoUrl"
            name="videoUrl"
            type="url"
            defaultValue={lesson?.videoUrl ?? ""}
            placeholder="https://..."
            disabled={isPending}
          />
          {state?.fieldErrors?.videoUrl && (
            <p className="text-xs text-red-600">{state.fieldErrors.videoUrl[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lesson-duration">Duracao (segundos)</Label>
          <Input
            id="lesson-duration"
            name="duration"
            type="number"
            min="0"
            defaultValue={lesson?.duration ?? 0}
            placeholder="600"
            disabled={isPending}
          />
          <p className="text-[10px] text-slate-500">
            Use segundos. Ex: 10min = 600
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-description">Descricao (opcional)</Label>
        <textarea
          id="lesson-description"
          name="description"
          defaultValue={lesson?.description ?? ""}
          rows={3}
          placeholder="Conteudo da aula, o que sera abordado"
          disabled={isPending}
          className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isFree"
          defaultChecked={lesson?.isFree ?? false}
          disabled={isPending}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm text-slate-700">Aula gratuita (visualizar sem matricula)</span>
      </label>

      {state?.message && !state.ok && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Salvar alteracoes" : "Criar aula"}
        </Button>
      </div>
    </form>
  );
}