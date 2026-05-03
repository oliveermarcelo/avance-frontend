"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Loader2,
  X,
  UserPlus,
  AlertTriangle,
  Copy,
  Check,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUserAction,
  type UserActionState,
} from "@/app/(admin)/admin/usuarios/actions";

export function CreateUserButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UserActionState | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setState(undefined);
    setCopied(false);
  };

  const close = () => {
    reset();
    setOpen(false);
  };

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    setCopied(false);
    startTransition(async () => {
      const result = await createUserAction(formData);
      setState(result);
    });
  };

  const handleCopy = async () => {
    if (!state?.generatedPassword) return;
    try {
      await navigator.clipboard.writeText(state.generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Nao foi possivel copiar. Selecione e copie manualmente.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Criar usuario
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <header className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Criar novo usuario
                </h2>
              </div>
              <button
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {state?.ok && state?.generatedPassword ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-900">
                    Usuario criado com sucesso
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {state.message}. Salve a senha temporaria abaixo antes de fechar.
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-amber-900">
                        Senha temporaria gerada
                      </p>
                      <p className="text-xs text-amber-800">
                        Esta senha sera mostrada apenas uma vez. Copie e envie por
                        canal seguro (WhatsApp, e-mail). Quando fechar essa janela,
                        a senha nao podera ser recuperada.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-white p-3">
                    <code className="flex-1 font-mono text-sm font-semibold text-slate-900 select-all">
                      {state.generatedPassword}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3.5 w-3.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  {state.createdUserId && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/usuarios/${state.createdUserId}`}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Editar usuario
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" onClick={close} className="ml-auto">
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                {state?.message && !state.ok && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {state.message}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-name">Nome completo</Label>
                  <Input
                    id="new-name"
                    name="name"
                    placeholder="Ex: Dr. Pedro Almeida"
                    required
                    autoFocus
                    disabled={isPending}
                  />
                  {state?.fieldErrors?.name && (
                    <p className="text-xs text-red-600">{state.fieldErrors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email">E-mail</Label>
                  <Input
                    id="new-email"
                    name="email"
                    type="email"
                    placeholder="usuario@exemplo.com.br"
                    required
                    disabled={isPending}
                  />
                  {state?.fieldErrors?.email && (
                    <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">Telefone (opcional)</Label>
                    <Input
                      id="new-phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-crm">CRM (opcional)</Label>
                    <Input
                      id="new-crm"
                      name="crm"
                      placeholder="CRM 12345"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-role">Papel</Label>
                  <select
                    id="new-role"
                    name="role"
                    defaultValue="STUDENT"
                    disabled={isPending}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="STUDENT">Aluno</option>
                    <option value="INSTRUCTOR">Instrutor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  Uma senha temporaria de 12 caracteres sera gerada automaticamente
                  e mostrada uma unica vez apos o cadastro.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={close}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Criar usuario
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}