import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  QrCode,
  Copy,
  FileText,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActiveGateway } from "@/lib/settings";
import { PaymentStatusPoller } from "@/components/public/payment-status-poller";
import { CopyButton } from "@/components/public/copy-button";

interface PixMeta {
  qrCode: string;
  qrCodeImage: string;
  expiresAt: string;
}

interface BoletoMeta {
  barcode: string;
  pdfUrl: string;
  dueDate: string;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function CheckoutAwaitingPage({
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
    redirect(`/login?redirect=/checkout/${slug}/aguardando?tx=${tx}`);
  }

  const payment = await db.payment.findFirst({
    where: { transactionId: tx, userId: session.user.id },
    include: {
      course: {
        select: {
          slug: true,
          title: true,
          thumbnail: true,
        },
      },
    },
  });

  if (!payment) notFound();

  if (payment.course.slug !== slug) {
    redirect(`/checkout/${payment.course.slug}/aguardando?tx=${tx}`);
  }

  if (payment.status === "PAID") {
    redirect(`/checkout/${slug}/sucesso?tx=${tx}`);
  }

  const metadata = (payment.metadata as { pix?: PixMeta; boleto?: BoletoMeta } | null) ?? {};
  const activeGateway = await getActiveGateway();
  const isMock = activeGateway === "MOCK";

  return (
    <div className="bg-slate-50 pt-16 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-10">
        <Link
          href={`/curso/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#1F3A2D]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar ao curso
        </Link>

        <div className="mt-6 space-y-6">
          <header>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
              Aguardando pagamento
            </p>
            <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
              Seu pedido esta quase pronto
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Conclua o pagamento usando as instrucoes abaixo. Vamos confirmar
              automaticamente assim que receber.
            </p>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                {payment.course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payment.course.thumbnail}
                    alt={payment.course.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Voce esta comprando
                </p>
                <p className="font-bold text-[#1F3A2D] line-clamp-2">
                  {payment.course.title}
                </p>
                <p className="mt-1 font-montserrat text-xl font-bold text-[#1F3A2D]">
                  {formatPrice(Number(payment.amount))}
                </p>
              </div>
            </div>
          </div>

          <PaymentStatusPoller transactionId={tx} isMock={isMock} />

          {payment.method === "PIX" && metadata.pix && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <header className="flex items-center gap-3 mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1F3A2D] text-white">
                  <QrCode className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900">Pague via PIX</h2>
                  <p className="text-xs text-slate-500">
                    Use o app do seu banco para escanear ou copiar o codigo
                  </p>
                </div>
              </header>

              <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
                <div className="flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-3">
                  {metadata.pix.qrCodeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={metadata.pix.qrCodeImage}
                      alt="QR Code PIX"
                      className="h-44 w-44 object-contain"
                    />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center text-slate-300">
                      <QrCode className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Como pagar
                    </p>
                    <ol className="mt-2 space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha pagar com PIX por QR Code ou copia e cola</li>
                      <li>Escaneie ou cole o codigo abaixo</li>
                      <li>Confirme as informacoes e finalize</li>
                    </ol>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Codigo PIX (copia e cola)
                    </p>
                    <div className="relative rounded-md border border-slate-200 bg-slate-50 p-2.5">
                      <p className="break-all text-[10px] font-mono text-slate-600 leading-relaxed pr-2">
                        {metadata.pix.qrCode}
                      </p>
                    </div>
                    <CopyButton
                      text={metadata.pix.qrCode}
                      label="Copiar codigo"
                      successLabel="Copiado!"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {payment.method === "BOLETO" && metadata.boleto && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <header className="flex items-center gap-3 mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1F3A2D] text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900">Pague via boleto</h2>
                  <p className="text-xs text-slate-500">
                    Compensacao em 1-2 dias uteis apos pagamento
                  </p>
                </div>
              </header>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Linha digitavel
                  </p>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="break-all font-mono text-xs text-slate-700">
                      {metadata.boleto.barcode}
                    </p>
                  </div>
                  <CopyButton
                    text={metadata.boleto.barcode}
                    label="Copiar linha digitavel"
                    successLabel="Copiado!"
                  />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold">Vencimento:</span>{" "}
                    {new Date(metadata.boleto.dueDate).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-slate-500">
                    Pague em qualquer banco, casa lotericas ou app do seu banco
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Pagamento seguro</p>
              <p className="mt-0.5">
                Voce sera matriculado automaticamente assim que confirmarmos o
                pagamento. Nao feche esta pagina enquanto aguarda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";