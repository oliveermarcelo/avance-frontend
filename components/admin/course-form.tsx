"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCourseAction,
  updateCourseAction,
  type CourseFormState,
} from "@/app/(admin)/admin/cursos/actions";

interface Option {
  id: string;
  name: string;
  email?: string;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  categoryId: string | null;
  instructorId: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price: { toNumber(): number } | number;
  isFree: boolean;
  isPremium: boolean;
  thumbnail: string | null;
  trailer: string | null;
}

interface CourseFormProps {
  mode: "create" | "edit";
  course?: CourseData;
  instructors: Option[];
  categories: Option[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CourseForm({ mode, course, instructors, categories }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CourseFormState | undefined>(undefined);

  const initialPrice =
    typeof course?.price === "object" ? course.price.toNumber() : Number(course?.price ?? 0);

  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [isFree, setIsFree] = useState(course?.isFree ?? false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createCourseAction(undefined, formData);
          if (result?.fieldErrors || result?.message) {
            setState(result);
          }
        } else {
          const result = await updateCourseAction(undefined, formData);
          setState(result);
          if (result?.ok) {
            router.refresh();
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        setState({ message: "Erro inesperado. Tente novamente." });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl">
      {course && <input type="hidden" name="courseId" value={course.id} />}

      <div className="flex items-center justify-between">
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para cursos
        </Link>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Criar curso" : "Salvar alteracoes"}
            </>
          )}
        </Button>
      </div>

      {state?.message && (
        <div
          className={
            state.ok
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          }
        >
          {state.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Informacoes basicas</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Titulo do curso</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Harmonizacao Facial Avancada"
            required
            disabled={isPending}
          />
          {state?.fieldErrors?.title && (
            <p className="text-xs text-red-600">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">Slug (URL)</Label>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
                className="h-3 w-3"
              />
              Gerar automaticamente
            </label>
          </div>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="harmonizacao-facial-avancada"
            required
            disabled={isPending}
          />
          <p className="text-xs text-slate-500">
            URL final: /curso/<span className="font-mono">{slug || "[slug]"}</span>
          </p>
          {state?.fieldErrors?.slug && (
            <p className="text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Descricao curta</Label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={course?.shortDescription ?? ""}
            rows={2}
            maxLength={280}
            placeholder="Frase de impacto que descreve o curso (ate 280 caracteres)"
            required
            disabled={isPending}
            className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {state?.fieldErrors?.shortDescription && (
            <p className="text-xs text-red-600">
              {state.fieldErrors.shortDescription[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descricao completa</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={course?.description ?? ""}
            rows={6}
            maxLength={5000}
            placeholder="O que o aluno vai aprender, para quem e o curso, etc"
            disabled={isPending}
            className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Classificacao</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={course?.categoryId ?? ""}
              disabled={isPending}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructorId">Instrutor</Label>
            <select
              id="instructorId"
              name="instructorId"
              defaultValue={course?.instructorId ?? ""}
              required
              disabled={isPending}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Selecione...</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} {i.email ? `(${i.email})` : ""}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.instructorId && (
              <p className="text-xs text-red-600">
                {state.fieldErrors.instructorId[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivel</Label>
            <select
              id="level"
              name="level"
              defaultValue={course?.level ?? "INTERMEDIATE"}
              disabled={isPending}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="BEGINNER">Iniciante</option>
              <option value="INTERMEDIATE">Intermediario</option>
              <option value="ADVANCED">Avancado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Comercial</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Preco (R$)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialPrice.toString()}
              disabled={isPending || isFree}
            />
            {state?.fieldErrors?.price && (
              <p className="text-xs text-red-600">{state.fieldErrors.price[0]}</p>
            )}
          </div>

          <div className="space-y-3 pt-7">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Curso gratuito</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPremium"
                defaultChecked={course?.isPremium ?? false}
                disabled={isPending}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Marcar como premium (badge dourado)</span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Midia (opcional)</h2>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">URL da thumbnail</Label>
          <Input
            id="thumbnail"
            name="thumbnail"
            type="url"
            defaultValue={course?.thumbnail ?? ""}
            placeholder="https://..."
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trailer">URL do trailer (video)</Label>
          <Input
            id="trailer"
            name="trailer"
            type="url"
            defaultValue={course?.trailer ?? ""}
            placeholder="https://..."
            disabled={isPending}
          />
        </div>
      </section>
    </form>
  );
}