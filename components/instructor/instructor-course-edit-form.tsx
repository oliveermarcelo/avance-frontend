"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { updateInstructorCourseAction } from "@/app/(instructor)/instrutor/cursos/[id]/editar/actions";

interface Category {
  id: string;
  name: string;
}

interface CourseEditFormProps {
  course: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    thumbnail: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    categoryId: string;
    price: number;
    isFree: boolean;
    isPublished: boolean;
  };
  categories: Category[];
}

const levelOptions: Array<{ value: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; label: string }> = [
  { value: "BEGINNER", label: "Iniciante" },
  { value: "INTERMEDIATE", label: "Intermediario" },
  { value: "ADVANCED", label: "Avancado" },
];

function formatPriceInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InstructorCourseEditForm({ course, categories }: CourseEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(course.title);
  const [shortDescription, setShortDescription] = useState(course.shortDescription);
  const [description, setDescription] = useState(course.description);
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [level, setLevel] = useState(course.level);
  const [categoryId, setCategoryId] = useState(course.categoryId);
  const [priceDisplay, setPriceDisplay] = useState(
    course.price > 0
      ? course.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ""
  );
  const [isPublished, setIsPublished] = useState(course.isPublished);

  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("shortDescription", shortDescription);
    formData.append("description", description);
    formData.append("thumbnail", thumbnail);
    formData.append("level", level);
    formData.append("categoryId", categoryId);
    formData.append("price", priceDisplay);
    if (isPublished) formData.append("isPublished", "on");

    startTransition(async () => {
      const result = await updateInstructorCourseAction(course.id, undefined, formData);
      if (result.ok) {
        setFeedback({ ok: true, message: result.message ?? "Salvo!" });
      } else {
        setFeedback({
          ok: false,
          message: result.message ?? "Verifique os campos abaixo",
        });
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
            feedback.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          )}
          <p
            className={`text-sm font-semibold ${
              feedback.ok ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Informacoes basicas
        </h3>

        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-bold text-slate-700">
            Titulo do curso
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
          />
          {fieldErrors.title && (
            <p className="text-[10px] text-red-600">{fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="shortDescription" className="text-xs font-bold text-slate-700">
            Descricao curta
          </label>
          <input
            id="shortDescription"
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            disabled={isPending}
            maxLength={280}
            placeholder="Em uma frase, do que se trata o curso"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">
              Aparece nos cards de listagem
            </p>
            <p className="text-[10px] text-slate-400">{shortDescription.length}/280</p>
          </div>
          {fieldErrors.shortDescription && (
            <p className="text-[10px] text-red-600">{fieldErrors.shortDescription[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-bold text-slate-700">
            Descricao completa
          </label>
          <textarea
            id="description"
            rows={8}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            placeholder="O que os alunos vao aprender, para quem e o curso, requisitos, etc."
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">
              Aparece na pagina publica do curso
            </p>
            <p className="text-[10px] text-slate-400">{description.length}/5000</p>
          </div>
          {fieldErrors.description && (
            <p className="text-[10px] text-red-600">{fieldErrors.description[0]}</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Imagem de capa
        </h3>

        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div className="aspect-video sm:aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="thumbnail" className="text-xs font-bold text-slate-700">
              URL da imagem
            </label>
            <input
              id="thumbnail"
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              disabled={isPending}
              placeholder="https://..."
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
            />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Recomendado: 1280x720px. Em breve, upload direto.
            </p>
            {fieldErrors.thumbnail && (
              <p className="text-[10px] text-red-600">{fieldErrors.thumbnail[0]}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Categoria e nivel
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="text-xs font-bold text-slate-700">
              Categoria
            </label>
            <select
              id="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isPending}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-[10px] text-red-600">{fieldErrors.categoryId[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="level" className="text-xs font-bold text-slate-700">
              Nivel
            </label>
            <select
              id="level"
              required
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              disabled={isPending}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
            >
              {levelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Preco e publicacao
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="price" className="text-xs font-bold text-slate-700">
              Preco (R$)
            </label>
            <input
              id="price"
              type="text"
              inputMode="numeric"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(formatPriceInput(e.target.value))}
              disabled={isPending || course.isFree}
              placeholder="0,00"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60 disabled:bg-slate-50"
            />
            {course.isFree && (
              <p className="text-[10px] text-slate-500">
                Curso gratuito (definido pelo admin).
              </p>
            )}
            {fieldErrors.price && (
              <p className="text-[10px] text-red-600">{fieldErrors.price[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Status do curso</p>
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 cursor-pointer hover:border-[#1E5A8C] transition">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1E5A8C] focus:ring-[#1E5A8C]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">
                  {isPublished ? "Publicado" : "Rascunho"}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {isPublished
                    ? "O curso aparece no catalogo e pode ser comprado."
                    : "O curso fica oculto. Marque para publicar."}
                </p>
              </div>
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
        <Link
          href={`/instrutor/cursos/${course.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1E5A8C] px-5 text-xs font-bold text-white transition hover:bg-[#164767] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Salvar alteracoes
            </>
          )}
        </button>
      </div>
    </form>
  );
}