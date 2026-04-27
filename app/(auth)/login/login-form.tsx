"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "../actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState<LoginState | undefined, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
          Bem-vindo de volta
        </p>
        <h1 className="text-3xl font-bold text-primary">Entrar na plataforma</h1>
        <p className="text-sm text-muted-foreground">
          Acesse seus cursos, mentorias e certificados.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={isPending}
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/recuperar-senha"
              className="text-xs font-medium text-accent hover:underline"
            >
              Esqueceu?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isPending}
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        {state?.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-medium text-destructive">{state.error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-accent hover:underline">
          Cadastre-se
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
          Credenciais de teste
        </p>
        <div className="space-y-1 text-xs text-muted-foreground font-mono">
          <p><strong className="text-foreground">aluno@avance.com.br</strong> / aluno123</p>
          <p><strong className="text-foreground">dr.silva@avance.com.br</strong> / instrutor123</p>
          <p><strong className="text-foreground">admin@avance.com.br</strong> / admin123</p>
        </div>
      </div>
    </div>
  );
}