"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Star,
  Filter,
  Trash2,
  Search,
  Calendar,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { deleteReviewAction } from "@/app/(admin)/admin/avaliacoes/actions";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userInitials: string;
  courseId: string;
  courseTitle: string;
}

interface CourseOption {
  id: string;
  title: string;
}

interface ReviewsListProps {
  reviews: Review[];
  courses: CourseOption[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function StarsDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsList({ reviews, courses }: ReviewsListProps) {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (ratingFilter !== "ALL" && r.rating !== ratingFilter) return false;
      if (courseFilter !== "ALL" && r.courseId !== courseFilter) return false;
      if (q) {
        const hay = `${r.userName} ${r.userEmail} ${r.comment ?? ""} ${r.courseTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, search, ratingFilter, courseFilter]);

  const handleDelete = (reviewId: string) => {
    if (
      !confirm(
        "Excluir essa avaliacao? Essa acao nao pode ser desfeita. A media do curso sera recalculada."
      )
    )
      return;
    const fd = new FormData();
    fd.append("reviewId", reviewId);
    startTransition(() => deleteReviewAction(fd));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, curso ou comentario..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={ratingFilter === "ALL" ? "ALL" : String(ratingFilter)}
            onChange={(e) =>
              setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todas as notas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none max-w-[220px]"
          >
            <option value="ALL">Todos os cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} de {reviews.length}{" "}
        {reviews.length === 1 ? "avaliacao" : "avaliacoes"}
      </p>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <header className="mb-3 flex items-start gap-3">
                {review.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {review.userInitials}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {review.userName}
                    </p>
                    <StarsDisplay rating={review.rating} size="sm" />
                  </div>
                  <p className="truncate text-xs text-slate-500">{review.userEmail}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                    <Link
                      href={`/admin/cursos/${review.courseId}`}
                      className="inline-flex items-center gap-1 transition hover:text-slate-700"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {review.courseTitle}
                    </Link>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={isPending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  title="Excluir avaliacao"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </header>

              {review.comment ? (
                <blockquote className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700 italic">
                  "{review.comment}"
                </blockquote>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Sem comentario.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <MessageSquare className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {reviews.length === 0 ? "Nenhuma avaliacao ainda" : "Nenhum resultado"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {reviews.length === 0
              ? "As avaliacoes dos alunos aparecerao aqui."
              : "Tente ajustar os filtros."}
          </p>
        </div>
      )}
    </div>
  );
}