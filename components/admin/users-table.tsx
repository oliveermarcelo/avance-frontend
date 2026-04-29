"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  Power,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toggleUserActiveAction } from "@/app/(admin)/admin/usuarios/actions";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

interface UserRow {
  id: string;
  email: string;
  name: string;
  crm: string | null;
  avatar: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  initials: string;
  enrollmentCount: number;
  taughtCount: number;
}

interface UsersTableProps {
  users: UserRow[];
  currentUserId: string;
}

const roleLabels: Record<Role, string> = {
  STUDENT: "Aluno",
  INSTRUCTOR: "Instrutor",
  ADMIN: "Admin",
};

const roleStyles: Record<Role, string> = {
  STUDENT: "bg-blue-50 text-blue-700",
  INSTRUCTOR: "bg-emerald-50 text-emerald-700",
  ADMIN: "bg-violet-50 text-violet-700",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.isActive) return false;
      if (statusFilter === "INACTIVE" && u.isActive) return false;
      if (q) {
        const hay = `${u.name} ${u.email} ${u.crm ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleToggleActive = (userId: string) => {
    if (userId === currentUserId) {
      alert("Voce nao pode desativar a propria conta");
      return;
    }
    if (!confirm("Confirma alterar o status desse usuario?")) return;
    const fd = new FormData();
    fd.append("userId", userId);
    startTransition(() => toggleUserActiveAction(fd));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CRM..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todos os papeis</option>
            <option value="STUDENT">Alunos</option>
            <option value="INSTRUCTOR">Instrutores</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} de {users.length} {users.length === 1 ? "usuario" : "usuarios"}
      </p>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Usuario
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Papel
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Atividade
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Cadastro
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
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {user.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-normal text-slate-500">
                                (voce)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                          {user.crm && (
                            <p className="truncate text-[10px] text-slate-400">{user.crm}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          roleStyles[user.role]
                        )}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {user.role === "INSTRUCTOR" || user.role === "ADMIN" ? (
                        <span>
                          {user.taughtCount}{" "}
                          {user.taughtCount === 1 ? "curso" : "cursos"}
                        </span>
                      ) : (
                        <span>
                          {user.enrollmentCount}{" "}
                          {user.enrollmentCount === 1 ? "matricula" : "matriculas"}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          user.isActive
                            ? "inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"
                            : "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                        }
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          disabled={isSelf || isPending}
                          className={
                            isSelf
                              ? "flex h-8 w-8 items-center justify-center rounded-md text-slate-300 cursor-not-allowed"
                              : user.isActive
                              ? "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              : "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                          }
                          title={
                            isSelf
                              ? "Voce nao pode alterar o proprio status"
                              : user.isActive
                              ? "Desativar"
                              : "Ativar"
                          }
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/admin/usuarios/${user.id}`} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">Nenhum usuario encontrado com esses filtros.</p>
        </div>
      )}
    </div>
  );
}