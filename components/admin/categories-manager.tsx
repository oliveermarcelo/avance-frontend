"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Tags,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoryAction,
  type CategoryActionState,
} from "@/app/(admin)/admin/categorias/actions";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  courseCount: number;
}

interface CategoriesManagerProps {
  categories: Category[];
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

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = (categoryId: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    setDeleteError(null);
    const fd = new FormData();
    fd.append("categoryId", categoryId);
    startTransition(async () => {
      const result = await deleteCategoryAction(fd);
      if (result?.message && !result.ok) {
        setDeleteError(result.message);
      }
    });
  };

  const handleReorder = (categoryId: string, direction: "up" | "down") => {
    const fd = new FormData();
    fd.append("categoryId", categoryId);
    fd.append("direction", direction);
    startTransition(() => reorderCategoryAction(fd));
  };

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 text-sm text-red-700">{deleteError}</div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {categories.length === 0 && !creating && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Tags className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Nenhuma categoria cadastrada
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Comece criando a primeira categoria pra organizar os cursos.
          </p>
          <Button onClick={() => setCreating(true)} className="mt-5">
            <Plus className="mr-2 h-4 w-4" />
            Criar primeira categoria
          </Button>
        </div>
      )}

      {categories.map((category, idx) => {
        if (editingId === category.id) {
          return (
            <CategoryForm
              key={category.id}
              category={category}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <div
            key={category.id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: category.color ?? "#1F3A2D" }}
            >
              <Tags className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-slate-500 line-clamp-1">
                  {category.description}
                </p>
              )}
              <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="font-mono">/{category.slug}</span>
                <span>·</span>
                <span>
                  {category.courseCount} {category.courseCount === 1 ? "curso" : "cursos"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleReorder(category.id, "up")}
                disabled={idx === 0 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                title="Subir"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReorder(category.id, "down")}
                disabled={idx === categories.length - 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                title="Descer"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditingId(category.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                disabled={isPending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}

      {creating ? (
        <CategoryForm
          onSuccess={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      ) : (
        categories.length > 0 && (
          <Button onClick={() => setCreating(true)} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar categoria
          </Button>
        )
      )}
    </div>
  );
}

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEdit = !!category;
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CategoryActionState | undefined>(undefined);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [color, setColor] = useState(category?.color ?? "#1F3A2D");

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      const action = isEdit ? updateCategoryAction : createCategoryAction;
      const result = await action(formData);
      setState(result);
      if (result?.ok) {
        onSuccess();
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-xl border-2 border-slate-300 bg-slate-50 p-5"
    >
      {isEdit && <input type="hidden" name="categoryId" value={category.id} />}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          {isEdit ? "Editar categoria" : "Nova categoria"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cat-name">Nome</Label>
          <Input
            id="cat-name"
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Estetica"
            required
            autoFocus
            disabled={isPending}
          />
          {state?.fieldErrors?.name && (
            <p className="text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="cat-slug">Slug</Label>
            <label className="flex items-center gap-1 text-[10px] text-slate-500">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
                className="h-3 w-3"
              />
              Automatico
            </label>
          </div>
          <Input
            id="cat-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="estetica"
            required
            disabled={isPending}
          />
          {state?.fieldErrors?.slug && (
            <p className="text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-description">Descricao (opcional)</Label>
        <textarea
          id="cat-description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          placeholder="Sobre os cursos dessa categoria"
          disabled={isPending}
          className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-color">Cor (hex)</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color || "#1F3A2D"}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-md border border-slate-300"
            disabled={isPending}
          />
          <Input
            id="cat-color"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#1F3A2D"
            className="flex-1 font-mono"
            disabled={isPending}
          />
        </div>
        {state?.fieldErrors?.color && (
          <p className="text-xs text-red-600">{state.fieldErrors.color[0]}</p>
        )}
      </div>

      {state?.message && !state.ok && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Salvar alteracoes" : "Criar categoria"}
        </Button>
      </div>
    </form>
  );
}