"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  Loader2,
  ShieldCheck,
  Clock,
  BookOpen,
  Award,
  Infinity as InfinityIcon,
  Star,
} from "lucide-react";
import { enrollInFreeCourseAction } from "@/app/(public)/curso/[slug]/actions";

type EnrollmentStatus =
  | "NOT_LOGGED_IN"
  | "NOT_ENROLLED"
  | "ENROLLED_ACTIVE"
  | "ENROLLED_COMPLETED"
  | "EXPIRED";

interface EnrollCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    price: number;
    isFree: boolean;
    isPremium: boolean;
    totalLessons: number;
    totalDuration: number;
    averageRating: number;
  };
  status: EnrollmentStatus;
  progress?: number;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDurationLong(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  if (hours < 1) {
    const m = Math.round(seconds / 60);
    return `${m} minutos de conteudo`;
  }
  return `${hours} horas de conteudo`;
}

const benefits = [
  { icon: InfinityIcon, label: "Acesso vitalicio" },
  { icon: Award, label: "Certificado de conclusao" },
  { icon: ShieldCheck, label: "7 dias de garantia" },
];

export function EnrollCard({ course, status, progress = 0 }: EnrollCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEnrollFree = () => {
    setErrorMessage(null);
    const fd = new FormData();
    fd.append("courseId", course.id);
    fd.append("slug", course.slug);
    startTransition(async () => {
      const result = await enrollInFreeCourseAction(fd);
      if (result?.redirectTo && result.ok) {
        router.push(result.redirectTo);
      } else if (result?.redirectTo && !result.ok) {
        router.push(`${result.redirectTo}?redirect=/curso/${course.slug}`);
      } else if (result?.message) {
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          {course.isFree ? (
            <p className="font-montserrat text-3xl font-bold text-emerald-600">
              Gratis
            </p>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Investimento unico
              </p>
              <p className="font-montserrat text-3xl font-bold text-[#1F3A2D]">
                {formatPrice(course.price)}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                ou em ate 12x sem juros
              </p>
            </>
          )}
        </div>

        <div className="space-y-4 p-6">
          {status === "ENROLLED_ACTIVE" && (
            <>
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-2 text-sm font-bold text-emerald-700">
                  Voce ja esta matriculado
                </p>
                {progress > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-emerald-200">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-emerald-700">
                      {Math.round(progress)}% concluido
                    </p>
                  </div>
                )}
              </div>
              <Link
                href={`/aprender/${course.slug}`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1F3A2D] text-sm font-semibold text-white transition hover:bg-[#163024]"
              >
                <PlayCircle className="h-4 w-4" />
                {progress > 0 ? "Continuar curso" : "Comecar curso"}
              </Link>
            </>
          )}

          {status === "ENROLLED_COMPLETED" && (
            <>
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <Award className="mx-auto h-6 w-6 text-amber-600" />
                <p className="mt-2 text-sm font-bold text-amber-700">
                  Curso concluido
                </p>
                <p className="text-[10px] text-amber-600 mt-1">
                  Parabens! Voce concluiu este curso.
                </p>
              </div>
              <Link
                href={`/aprender/${course.slug}`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white border border-[#1F3A2D] text-sm font-semibold text-[#1F3A2D] transition hover:bg-[#1F3A2D] hover:text-white"
              >
                <PlayCircle className="h-4 w-4" />
                Revisar conteudo
              </Link>
            </>
          )}

          {(status === "NOT_LOGGED_IN" || status === "NOT_ENROLLED" || status === "EXPIRED") && (
            <>
              {status === "EXPIRED" && (
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-xs text-amber-700">
                    Sua matricula anterior expirou. Renove o acesso.
                  </p>
                </div>
              )}

              {course.isFree ? (
                status === "NOT_LOGGED_IN" ? (
                  <Link
                    href={`/cadastro?redirect=/curso/${course.slug}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#C9A227] text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A]"
                  >
                    Acessar gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollFree}
                    disabled={isPending}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#C9A227] text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Matriculando...
                      </>
                    ) : (
                      <>
                        Matricular-me gratis
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )
              ) : (
                <>
                  {status === "NOT_LOGGED_IN" ? (
                    <Link
                      href={`/cadastro?redirect=/curso/${course.slug}`}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#C9A227] text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A]"
                    >
                      Comprar agora
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/checkout/${course.slug}`}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#C9A227] text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A]"
                    >
                      Comprar agora
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  {status === "NOT_LOGGED_IN" && (
                    <p className="text-center text-[10px] text-slate-500">
                      Ja tem conta?{" "}
                      <Link
                        href={`/login?redirect=/curso/${course.slug}`}
                        className="font-semibold text-[#1F3A2D] hover:underline"
                      >
                        Faca login
                      </Link>
                    </p>
                  )}
                </>
              )}

              {errorMessage && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorMessage}
                </p>
              )}
            </>
          )}

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Esse curso inclui
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-slate-700">
                <BookOpen className="h-3.5 w-3.5 text-[#C9A227]" />
                {course.totalLessons} aulas em video
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-700">
                <Clock className="h-3.5 w-3.5 text-[#C9A227]" />
                {formatDurationLong(course.totalDuration)}
              </li>
              {course.averageRating > 0 && (
                <li className="flex items-center gap-2 text-xs text-slate-700">
                  <Star className="h-3.5 w-3.5 fill-[#C9A227] text-[#C9A227]" />
                  Avaliacao {course.averageRating.toFixed(1)} de 5.0
                </li>
              )}
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li
                    key={benefit.label}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#C9A227]" />
                    {benefit.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}