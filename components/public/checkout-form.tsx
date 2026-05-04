"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CreditCard as CardIcon,
  FileText,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutAction } from "@/app/(public)/checkout/[slug]/actions";
import { cn } from "@/lib/utils";

type Method = "PIX" | "CREDIT_CARD" | "BOLETO";

interface CheckoutFormProps {
  course: {
    id: string;
    slug: string;
    title: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
  gatewayName: string;
}

const methodTabs: Array<{
  value: Method;
  label: string;
  icon: typeof QrCode;
  description: string;
}> = [
  {
    value: "PIX",
    label: "PIX",
    icon: QrCode,
    description: "Aprovacao instantanea",
  },
  {
    value: "CREDIT_CARD",
    label: "Cartao",
    icon: CardIcon,
    description: "Ate 12x sem juros",
  },
  {
    value: "BOLETO",
    label: "Boleto",
    icon: FileText,
    description: "Aprovado em 1-2 dias",
  },
];

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCard(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function calculateInstallment(price: number, n: number): number {
  return price / n;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function CheckoutForm({ course, user, gatewayName }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<Method>("PIX");

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState(user.phone ? maskPhone(user.phone) : "");

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);

  const isMockGateway = gatewayName === "MOCK";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      setError("CPF invalido. Use 11 digitos.");
      return;
    }

    if (method === "CREDIT_CARD") {
      const cardDigits = cardNumber.replace(/\D/g, "");
      if (cardDigits.length < 13) {
        setError("Numero do cartao invalido");
        return;
      }
      if (!cardHolder.trim()) {
        setError("Nome do titular obrigatorio");
        return;
      }
      const expiryParts = cardExpiry.split("/");
      if (expiryParts.length !== 2 || expiryParts[0].length !== 2) {
        setError("Validade invalida (MM/AA)");
        return;
      }
      if (cardCvv.length < 3) {
        setError("CVV invalido");
        return;
      }
    }

    const formData = new FormData();
    formData.append("courseId", course.id);
    formData.append("method", method);
    formData.append(
      "customer",
      JSON.stringify({
        name,
        email,
        cpf: cpfDigits,
        phone: phone.replace(/\D/g, "") || null,
      })
    );

    if (method === "CREDIT_CARD") {
      const expiryParts = cardExpiry.split("/");
      formData.append(
        "card",
        JSON.stringify({
          holderName: cardHolder.trim(),
          number: cardNumber.replace(/\D/g, ""),
          expiryMonth: expiryParts[0],
          expiryYear: expiryParts[1],
          cvv: cardCvv,
          installments,
        })
      );
    }

    startTransition(async () => {
      const result = await createCheckoutAction(formData);
      if (result?.redirectTo && result.ok) {
        router.push(result.redirectTo);
      } else if (result?.message) {
        setError(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isMockGateway && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">
            Modo de teste ativo
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
            O gateway atual e MOCK. Os pagamentos sao simulados: cartao confirma
            instantaneamente, PIX confirma apos 3 segundos, boleto fica pendente.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Seus dados</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            required
            disabled={isPending}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Metodo de pagamento</h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {methodTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = method === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setMethod(tab.value)}
                disabled={isPending}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  isActive
                    ? "border-[#1F3A2D] bg-[#1F3A2D]/5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    isActive ? "bg-[#1F3A2D] text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{tab.label}</p>
                  <p className="text-[10px] text-slate-500">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {method === "PIX" && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1F3A2D] text-white">
              <QrCode className="h-4 w-4" />
            </span>
            <div className="text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">Pagamento via PIX</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Apos clicar em &ldquo;Finalizar&rdquo;, voce recebera um QR code.
                A confirmacao e instantanea apos o pagamento.
              </p>
            </div>
          </div>
        </section>
      )}

      {method === "CREDIT_CARD" && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Numero do cartao</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(maskCard(e.target.value))}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
              required={method === "CREDIT_CARD"}
              disabled={isPending}
              className="font-mono bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolder">Nome do titular</Label>
            <Input
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder="COMO ESTA NO CARTAO"
              autoComplete="cc-name"
              required={method === "CREDIT_CARD"}
              disabled={isPending}
              className="bg-white uppercase"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cardExpiry">Validade</Label>
              <Input
                id="cardExpiry"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                placeholder="MM/AA"
                autoComplete="cc-exp"
                required={method === "CREDIT_CARD"}
                disabled={isPending}
                className="bg-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardCvv">CVV</Label>
              <Input
                id="cardCvv"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="000"
                autoComplete="cc-csc"
                required={method === "CREDIT_CARD"}
                disabled={isPending}
                className="bg-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <select
                id="installments"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A2D]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x de {formatPrice(calculateInstallment(course.price, n))}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {method === "BOLETO" && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1F3A2D] text-white">
              <FileText className="h-4 w-4" />
            </span>
            <div className="text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">Pagamento via boleto</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Apos clicar em &ldquo;Finalizar&rdquo;, voce recebera o boleto.
                A compensacao leva ate 2 dias uteis.
              </p>
            </div>
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#C9A227] text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Finalizar pagamento - {formatPrice(course.price)}
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-500">
        Ao continuar, voce concorda com os{" "}
        <a href="/termos" target="_blank" className="font-semibold text-[#1F3A2D] hover:underline">
          termos de uso
        </a>
        {" "}e a{" "}
        <a href="/privacidade" target="_blank" className="font-semibold text-[#1F3A2D] hover:underline">
          politica de privacidade
        </a>
      </p>
    </form>
  );
}