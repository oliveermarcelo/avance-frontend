"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type SignupState } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  if (password.length === 0) {
    return { score: 0, label: "", color: "bg-slate-200" };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const safeScore = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  if (safeScore <= 1) return { score: safeScore, label: "Fraca", color: "bg-red-500" };
  if (safeScore === 2) return { score: safeScore, label: "Razoavel", color: "bg-amber-500" };
  if (safeScore === 3) return { score: safeScore, label: "Forte", color: "bg-emerald-500" };
  return { score: safeScore, label: "Muito forte", color: "bg-emerald-600" };
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/inicio";

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SignupState | undefined>(undefined);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = (formData: FormData) => {
    setState(undefined);
    startTransition(async () => {
      const result = await signupAction(undefined, formData);
      if (result?.error || result?.fieldErrors) {
        setState(result);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          name="name"
          placeholder="Dr. Pedro Almeida"
          required
          autoComplete="name"
          autoFocus
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
          placeholder="seu.email@exemplo.com.br"
          required
          autoComplete="email"
          disabled={isPending}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefone <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="crm">
            CRM ou registro <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="crm"
            name="crm"
            placeholder="CRM 12345"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 8 caracteres"
            required
            autoComplete="new-password"
            disabled={isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= strength.score ? strength.color : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              Forca: <span className="font-semibold">{strength.label}</span>
              {strength.score < 3 && password.length >= 8 && (
                <span className="ml-2 text-slate-400">
                  Use letras, numeros e simbolos para aumentar
                </span>
              )}
            </p>
          </div>
        )}

        {state?.fieldErrors?.password && (
          <p className="text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            required
            autoComplete="new-password"
            disabled={isPending}
            className={cn(
              "pr-16",
              passwordsDontMatch && "border-red-300 focus:border-red-500",
              passwordsMatch && "border-emerald-300"
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {passwordsMatch && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-slate-400 hover:text-slate-600 px-1"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {passwordsDontMatch && (
          <p className="text-xs text-red-600">As senhas nao coincidem</p>
        )}
        {state?.fieldErrors?.confirmPassword && (
          <p className="text-xs text-red-600">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1F3A2D] focus:ring-[#1F3A2D]"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-semibold text-[#1F3A2D] hover:underline"
            >
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="font-semibold text-[#1F3A2D] hover:underline"
            >
              politica de privacidade
            </Link>
          </span>
        </label>
        {state?.fieldErrors?.acceptTerms && (
          <p className="text-xs text-red-600">{state.fieldErrors.acceptTerms[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !acceptTerms}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1F3A2D] text-sm font-semibold text-white transition hover:bg-[#163024] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            Criar conta
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Ja tem conta?{" "}
        <Link
          href={redirectTo !== "/inicio" ? `/login?redirect=${redirectTo}` : "/login"}
          className="font-semibold text-[#1F3A2D] hover:underline"
        >
          Faca login
        </Link>
      </p>
    </form>
  );
}