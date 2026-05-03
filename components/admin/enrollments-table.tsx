"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Filter,
  Ban,
  RefreshCw,
  CalendarPlus,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  cancelEnrollmentAction,
  reactivateEnrollmentAction,
  extendEnrollmentAction,
} from "@/app/(admin)/admin/matriculas/actions";
import { cn } from "@/lib/utils";

type Status = "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

interface EnrollmentRow {
  id: string;
  status: Status;
  progress: number;
  enrolledAt: string;
  lastAccessAt: string | null;
  expiresAt: string | null;
  userName: string;
  userEmail: string;
  userInitials: string;
  userAvatar: string | null;
  courseTitle: string;
  courseId: string;
  courseSlug: string;
}

interface CourseOption {
  id: string;
  title: string;
}

interface EnrollmentsTableProps {
  enrollments: EnrollmentRow[];
  courses: CourseOption[];
}

const statusLabels: Record<Status, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluida",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

const statusStyles: Record<Status, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-amber-50 text-amber-700",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatRelative(iso: string | null): string {
  if (!iso) return "Nunca";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays}d atras`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atras`;
  return formatDate(iso);
}

export function EnrollmentsTable({ enrollments, courses }: EnrollmentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrollments.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (courseFilter !== "ALL" && e.courseId !== courseFilter) return false;
      if (q) {
        const hay = `${e.userName} ${e.userEmail} ${e.courseTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enrollments, search, statusFilter, courseFilter]);

  const handleCancel = (id: string) => {
    if (!confirm("Cancelar essa matricula? O aluno perdera acesso ao curso.")) return;
    setActionError(null);
    const fd = new FormData();
    fd.append("enrollmentId", id);
    startTransition(() => cancelEnrollmentAction(fd));
  };

  const handleReactivate = (id: string) => {
    setActionError(null);
    const fd = new FormData();
    fd.append("enrollmentId", id);
    startTransition(() => reactivateEnrollmentAction(fd));
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 text-sm text-red-700">{actionError}</div>
          <button onClick={() => setActionError(null)}>
            <X className="h-4 w-4 text-red-400" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, e-mail ou curso..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="COMPLETED">Concluidas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="EXPIRED">Expiradas</option>
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
        {filtered.length} de {enrollments.length}{" "}
        {enrollments.length === 1 ? "matricula" : "matriculas"}
      </p>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Aluno
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Curso
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Progresso
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Acesso
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {e.userAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={e.userAvatar}
                          alt={e.userName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                          {e.userInitials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {e.userName}
                        </p>
                        <p className="truncate text-xs text-slate-500">{e.userEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {e.courseTitle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Matriculado em {formatDate(e.enrolledAt)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-200">
                        <div
                          className={
                            e.progress === 100
                              ? "h-full rounded-full bg-emerald-500"
                              : "h-full rounded-full bg-slate-700"
                          }
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10">
                        {Math.round(e.progress)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600">{formatRelative(e.lastAccessAt)}</p>
                    {e.expiresAt && (
                      <p className="text-[10px] text-slate-400">
                        Expira em {formatDate(e.expiresAt)}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        statusStyles[e.status]
                      )}
                    >
                      {statusLabels[e.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setExtendingId(e.id)}
                        disabled={isPending || e.status === "CANCELLED"}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                        title="Estender acesso"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </button>

                      {e.status === "CANCELLED" || e.status === "EXPIRED" ? (
                        <button
                          onClick={() => handleReactivate(e.id)}
                          disabled={isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"
                          title="Reativar"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCancel(e.id)}
                          disabled={isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          title="Cancelar"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma matricula encontrada com esses filtros.
          </p>
        </div>
      )}

      {extendingId && (
        <ExtendModal
          enrollmentId={extendingId}
          onClose={() => setExtendingId(null)}
        />
      )}
    </div>
  );
}

interface ExtendModalProps {
  enrollmentId: string;
  onClose: () => void;
}

function ExtendModal({ enrollmentId, onClose }: ExtendModalProps) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState(30);

  const handleExtend = () => {
    const fd = new FormData();
    fd.append("enrollmentId", enrollmentId);
    fd.append("daysToAdd", days.toString());
    startTransition(async () => {
      await extendEnrollmentAction(fd);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Estender acesso</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <p className="mb-5 text-sm text-slate-600">
          Adicione dias ao prazo de acesso desta matricula. Se o acesso ja expirou,
          o novo prazo conta a partir de hoje.
        </p>

        <div className="space-y-2">
          <Label htmlFor="days">Dias a adicionar</Label>
          <div className="flex items-center gap-2">
            <Input
              id="days"
              type="number"
              min="1"
              max="3650"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={isPending}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">dias</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[7, 30, 90, 180, 365].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
                  days === d
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                )}
                disabled={isPending}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleExtend} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Estender
          </Button>
        </div>
      </div>
    </div>
  );
}