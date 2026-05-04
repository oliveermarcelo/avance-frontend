import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  Award,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tx?: string }>;
}) {
  const { slug } = await params;
  const { tx } = await searchParams;

  if (!tx) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?redirect=/checkout/${slug}/sucesso?tx=${tx}`);
  }

  const payment = await db.payment.findFirst({
    where: { transactionId: tx, userId: session.user.id },
    include: {
      course: {
        select: {
          slug: true,
          title: true,
          thumbnail: true,
          totalLessons: true,
          totalDuration: true,
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!payment) notFound();

  if (payment.course.slug !== slug) {
    redirect(`/checkout/${payment.course.slug}/sucesso?tx=${tx}`);
  }

  if (payment.status !== "PAID") {
    redirect(`/checkout/${slug}/aguardando?tx=${tx}`);
  }

  return (
    <div className="bg-white pt-16 min-h-screen">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#1F3A2D] via-[#234433] to-[#1F3A2D] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-[#C9A227]/15 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8 lg:py-20 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
          </div>

          <h1 className="mt-8 font-montserrat text-3xl font-bold sm:text-4xl lg:text-5xl">
            Pagamento <span className="text-[#C9A227]">confirmado!</span>
          </h1>

          <p className="mt-4 text-lg text-white/80">
            Parabens, {payment.user.name.split(" ")[0]}! Sua matricula foi efetivada.
          </p>

          <p className="mt-2 text-sm text-white/60">
            Voce ja pode comecar a estudar quando quiser.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-video sm:aspect-auto bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                {payment.course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payment.course.thumbnail}
                    alt={payment.course.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                    Voce agora tem acesso a
                  </p>
                  <h2 className="mt-1 font-montserrat text-lg font-bold text-[#1F3A2D] sm:text-xl">
                    {payment.course.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{payment.course.totalLessons} aulas</span>
                  <span>{Math.round(payment.course.totalDuration / 3600)}h de conteudo</span>
                </div>

                <Link
                  href={`/aprender/${slug}`}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1F3A2D] text-sm font-bold text-white transition hover:bg-[#163024]"
                >
                  <PlayCircle className="h-4 w-4" />
                  Comecar a estudar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xs font-bold text-slate-900">7 dias de garantia</p>
              <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                Reembolso total se nao gostar. Basta solicitar pelo suporte.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-[#C9A227]">
                <Award className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xs font-bold text-slate-900">Certificado</p>
              <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                Receba certificado oficial ao concluir todas as aulas.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <Mail className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xs font-bold text-slate-900">Comprovante</p>
              <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                Enviado para {payment.user.email}.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Detalhes do pedido</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Numero do pedido</dt>
                <dd className="font-mono text-slate-700">{payment.id.slice(0, 12)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Metodo de pagamento</dt>
                <dd className="font-semibold text-slate-700">
                  {payment.method === "PIX" && "PIX"}
                  {payment.method === "CREDIT_CARD" && "Cartao de credito"}
                  {payment.method === "BOLETO" && "Boleto bancario"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Data</dt>
                <dd className="text-slate-700">
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleString("pt-BR")
                    : new Date(payment.createdAt).toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="font-semibold text-slate-900">Total pago</dt>
                <dd className="font-montserrat text-base font-bold text-[#1F3A2D]">
                  {formatPrice(Number(payment.amount))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/meus-cursos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1F3A2D]"
            >
              Ver todos os meus cursos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";