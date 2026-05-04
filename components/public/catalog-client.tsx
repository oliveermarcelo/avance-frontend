"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Clock,
  Users,
  PlayCircle,
  BookOpen,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  isPremium: boolean;
  level: Level;
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  category: { id: string; name: string; color: string | null } | null;
  instructor: { name: string };
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface CatalogClientProps {
  courses: CatalogCourse[];
  categories: Category[];
}

const levelLabels: Record<Level, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediario",
  ADVANCED: "Avancado",
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  if (hours < 1) {
    const m = Math.round(seconds / 60);
    return `${m}min`;
  }
  return `${hours}h`;
}

export function CatalogClient({ courses, categories }: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "ALL">("ALL");
  const [levelFilter, setLevelFilter] = useState<Level | "ALL">("ALL");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "FREE" | "PAID" | "PREMIUM">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (categoryFilter !== "ALL" && c.category?.id !== categoryFilter) return false;
      if (levelFilter !== "ALL" && c.level !== levelFilter) return false;
      if (priceFilter === "FREE" && !c.isFree) return false;
      if (priceFilter === "PAID" && (c.isFree || c.isPremium)) return false;
      if (priceFilter === "PREMIUM" && !c.isPremium) return false;
      if (q) {
        const hay = `${c.title} ${c.shortDescription} ${c.category?.name ?? ""} ${c.instructor.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [courses, search, categoryFilter, levelFilter, priceFilter]);

  const hasActiveFilters =
    categoryFilter !== "ALL" || levelFilter !== "ALL" || priceFilter !== "ALL" || search !== "";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setLevelFilter("ALL");
    setPriceFilter("ALL");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1F3A2D]">
              <Filter className="h-3.5 w-3.5" />
              Filtros
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#1F3A2D]"
              >
                <X className="h-3 w-3" />
                Limpar
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso..."
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Categoria
          </p>
          <div className="space-y-1">
            <FilterButton
              active={categoryFilter === "ALL"}
              onClick={() => setCategoryFilter("ALL")}
            >
              Todas
            </FilterButton>
            {categories.map((cat) => (
              <FilterButton
                key={cat.id}
                active={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color ?? "#1F3A2D" }}
                />
                {cat.name}
              </FilterButton>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Nivel
          </p>
          <div className="space-y-1">
            <FilterButton active={levelFilter === "ALL"} onClick={() => setLevelFilter("ALL")}>
              Todos
            </FilterButton>
            <FilterButton
              active={levelFilter === "BEGINNER"}
              onClick={() => setLevelFilter("BEGINNER")}
            >
              Iniciante
            </FilterButton>
            <FilterButton
              active={levelFilter === "INTERMEDIATE"}
              onClick={() => setLevelFilter("INTERMEDIATE")}
            >
              Intermediario
            </FilterButton>
            <FilterButton
              active={levelFilter === "ADVANCED"}
              onClick={() => setLevelFilter("ADVANCED")}
            >
              Avancado
            </FilterButton>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Preco
          </p>
          <div className="space-y-1">
            <FilterButton active={priceFilter === "ALL"} onClick={() => setPriceFilter("ALL")}>
              Todos
            </FilterButton>
            <FilterButton active={priceFilter === "FREE"} onClick={() => setPriceFilter("FREE")}>
              Gratuitos
            </FilterButton>
            <FilterButton active={priceFilter === "PAID"} onClick={() => setPriceFilter("PAID")}>
              Pagos
            </FilterButton>
            <FilterButton
              active={priceFilter === "PREMIUM"}
              onClick={() => setPriceFilter("PREMIUM")}
            >
              Premium
            </FilterButton>
          </div>
        </div>
      </aside>

      <section>
        <header className="mb-6 flex items-baseline justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-[#1F3A2D]">{filtered.length}</span>{" "}
            de {courses.length} {courses.length === 1 ? "curso" : "cursos"}
          </p>
        </header>

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <Link
                key={course.id}
                href={`/curso/${course.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-[#1F3A2D]/30 hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white/30" strokeWidth={1.5} />
                    </div>
                  )}

                  {course.isPremium && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#C9A227] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1F3A2D]">
                      Premium
                    </div>
                  )}

                  {course.category && (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur px-2 py-0.5">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: course.category.color ?? "#1F3A2D",
                        }}
                      />
                      <span className="text-[10px] font-semibold text-slate-700">
                        {course.category.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold">
                      {levelLabels[course.level]}
                    </span>
                  </div>

                  <h3 className="font-montserrat text-base font-bold text-[#1F3A2D] line-clamp-2 group-hover:text-[#163024]">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    Com{" "}
                    <span className="font-medium text-slate-700">
                      {course.instructor.name}
                    </span>
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-500 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.totalLessons} aulas
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(course.totalDuration)}
                    </span>
                    {course.enrollmentCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollmentCount}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                    {course.isFree ? (
                      <p className="font-montserrat text-lg font-bold text-emerald-600">
                        Gratis
                      </p>
                    ) : (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Investimento
                        </p>
                        <p className="font-montserrat text-xl font-bold text-[#1F3A2D]">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                    )}
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1F3A2D]/5 text-[#1F3A2D] transition-all group-hover:bg-[#1F3A2D] group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">
              Nenhum curso encontrado com esses filtros.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#1F3A2D] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-[#1F3A2D] text-white font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-[#1F3A2D]"
      )}
    >
      {children}
    </button>
  );
}