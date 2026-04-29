"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateUserAction,
  type UserActionState,
} from "@/app/(admin)/admin/usuarios/actions";

interface UserEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    crm: string | null;
    bio: string | null;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  };
  isSelf: boolean;
}

export function UserEditForm({ user, isSelf }: UserEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UserActionState | undefined>(undefined);
  const [role, setRole] = useState(user.role);

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      const result = await updateUserAction(formData);
      setState(result);
    });
  };

  const isElevatingToAdmin = role === "ADMIN" && user.role !== "ADMIN";

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={user.id} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Dados pessoais</h2>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar alteracoes
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
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              disabled={isPending}
            />
            {state?.fieldErrors?.name && (
              <p className="text-xs text-red-600">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              disabled={isPending}
            />
            {state?.fieldErrors?.email && (
              <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone ?? ""}
              placeholder="(11) 99999-9999"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm">CRM ou registro profissional</Label>
            <Input
              id="crm"
              name="crm"
              defaultValue={user.crm ?? ""}
              placeholder="CRM 12345"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (opcional, exibida publicamente)</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio ?? ""}
            rows={4}
            maxLength={2000}
            placeholder="Especialidades, formacao, experiencia..."
            disabled={isPending}
            className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Permissao</h2>

        <div className="space-y-2">
          <Label htmlFor="role">Papel na plataforma</Label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            disabled={isPending || isSelf}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="STUDENT">Aluno</option>
            <option value="INSTRUCTOR">Instrutor</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {isSelf && (
            <p className="text-xs text-slate-500">
              Voce nao pode alterar seu proprio papel.
            </p>
          )}
          {state?.fieldErrors?.role && (
            <p className="text-xs text-red-600">{state.fieldErrors.role[0]}</p>
          )}
        </div>

        {isElevatingToAdmin && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Atencao: voce esta promovendo este usuario a Administrador.</p>
              <p className="mt-1 text-xs">
                Admins tem acesso total: cadastrar e excluir cursos, alterar pagamentos, gerenciar
                outros usuarios e ver dados sensiveis. So promova quem realmente precisa.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
          <p><strong className="text-slate-900">Aluno:</strong> assiste cursos, recebe certificados</p>
          <p><strong className="text-slate-900">Instrutor:</strong> pode ser atribuido como autor de cursos</p>
          <p><strong className="text-slate-900">Administrador:</strong> acesso total ao painel</p>
        </div>
      </section>
    </form>
  );
}