"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { simulateMockPaymentSuccessAction } from "@/lib/checkout-actions";
import { cn } from "@/lib/utils";

type PollStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED" | "ERROR";

interface PaymentStatusPollerProps {
  transactionId: string;
  isMock?: boolean;
}

export function PaymentStatusPoller({
  transactionId,
  isMock = false,
}: PaymentStatusPollerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PollStatus>("PENDING");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/status?tx=${transactionId}`, {
          cache: "no-store",
        });
        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 404) setStatus("ERROR");
          return;
        }

        const data = await res.json();

        if (data.status === "PAID") {
          setStatus("PAID");
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (tickRef.current) clearInterval(tickRef.current);
          setTimeout(() => {
            if (data.redirectTo) router.push(data.redirectTo);
          }, 1500);
          return;
        }

        if (data.status === "FAILED" || data.status === "REFUNDED" || data.status === "CANCELLED") {
          setStatus(data.status);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (tickRef.current) clearInterval(tickRef.current);
        }
      } catch {
        // ignora erros de rede transientes, proxima iteracao tenta
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);
    tickRef.current = setInterval(() => {
      if (isMounted) setSecondsElapsed((s) => s + 1);
    }, 1000);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [transactionId, router]);

  const handleSimulate = async () => {
    const result = await simulateMockPaymentSuccessAction(transactionId);
    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  if (status === "PAID") {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-emerald-900">Pagamento confirmado!</p>
          <p className="text-xs text-emerald-700">
            Redirecionando para o curso...
          </p>
        </div>
      </div>
    );
  }

  if (status === "FAILED" || status === "REFUNDED" || status === "CANCELLED" || status === "ERROR") {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-red-900">
              {status === "FAILED" && "Pagamento falhou"}
              {status === "REFUNDED" && "Pagamento estornado"}
              {status === "CANCELLED" && "Pagamento cancelado"}
              {status === "ERROR" && "Erro ao verificar pagamento"}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {status === "ERROR"
                ? "Nao conseguimos verificar o status do seu pagamento. Tente novamente em alguns instantes."
                : "Tente novamente ou escolha outro metodo de pagamento."}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Voltar e tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Loader2 className="h-5 w-5 shrink-0 text-amber-600 animate-spin" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-900">Aguardando pagamento</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Verificando automaticamente...
          </p>
        </div>
        <div className={cn("flex items-center gap-1 text-amber-700")}>
          <Clock className="h-3 w-3" />
          <span className="font-mono text-xs font-semibold">{formattedTime}</span>
        </div>
      </div>

      {isMock && (
        <button
          type="button"
          onClick={handleSimulate}
          className="w-full rounded-md border-2 border-dashed border-amber-300 bg-amber-50/50 px-4 py-2.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition"
        >
          [Modo teste] Simular pagamento confirmado agora
        </button>
      )}
    </div>
  );
}