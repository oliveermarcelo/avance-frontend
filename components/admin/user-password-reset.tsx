"use client";

import { useState, useTransition } from "react";
import { Loader2, KeyRound, Copy, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resetUserPasswordAction,
  type UserActionState,
} from "@/app/(admin)/admin/usuarios/actions";

interface UserPasswordResetProps {
  userId: string;
  userName: string;
}

export function UserPasswordReset({ userId, userName }: UserPasswordResetProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UserActionState | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    if (
      !confirm(
        `Resetar senha de ${userName}? Todas as sessoes ativas serao invalidadas e o usuario sera deslogado.`
      )
    )
      return;

    setCopied(false);
    setState(undefined);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("userId", userId);
      const result = await resetUserPasswordAction(fd);
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

  const handleClose = () => {
    setState(undefined);
    setCopied(false);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Senha</h2>
          <p className="mt-1 text-xs text-slate-500">
            Gere uma senha temporaria. O usuario sera deslogado de todos os dispositivos
            e devera trocar a senha no proximo login.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Resetando...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-3.5 w-3.5" />
              Resetar senha
            </>
          )}
        </Button>
      </header>

      {state?.generatedPassword && (
        <div className="space-y-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold text-amber-900">
                Senha temporaria gerada
              </p>
              <p className="text-xs text-amber-800">
                Esta senha sera mostrada apenas uma vez. Copie e envie para {userName}
                por um canal seguro (WhatsApp, e-mail). Quando fechar essa caixa,
                a senha nao podera ser recuperada.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-amber-600 hover:text-amber-800"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
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
      )}

      {state?.message && !state.generatedPassword && !state.ok && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}
    </section>
  );
}