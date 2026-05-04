import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  Award,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActiveGateway } from "@/lib/settings";
import { CheckoutForm } from "@/components/public/checkout-form";

async function getCheckoutData(slug: string, userId: string) {
  const course = await db.course.findUnique({
    where: { slug, deletedAt: null, isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      thumbnail: true,
      price: true,
      isFree: true,
      isPremium: true,
      totalLessons: true,
      totalDuration: true,
      averageRating: true,
      instructor: { select: { name: true, avatar: true } },
      category: { select: { name: true, color: true } },
    },
  });

  if (!course) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });

  return { course, enrollment, user };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  if (hours < 1) {
    const m = Math.round(seconds / 60);
    return `${m}min`;
  }
  return `${hours}h`;
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/cadastro?redirect=/checkout/${slug}`);
  }

  const data = await getCheckoutData(slug, session.user.id);
  if (!data) notFound();

  const { course, enrollment, user } = data;

  if (course.isFree) {
    redirect(`/curso/${slug}`);
  }

  if (
    enrollment &&
    (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED")
  ) {
    redirect(`/aprender/${slug}`);
  }

  const activeGateway = await getActiveGateway();

  if (activeGateway === "NONE") {
    return (
      <div className="bg-white pt-16">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
            <Lock className="mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-4 font-montserrat text-2xl font-bold text-amber-900">
              Pagamentos indisponiveis
            </h1>
            <p className="mt-2 text-sm text-amber-700">
              O sistema de pagamentos ainda nao foi configurado. Volte mais tarde
              ou entre em contato com o suporte.
            </p>
            <Link
              href={`/curso/${slug}`}
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar ao curso
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const courseForClient = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    price: course.price.toNumber(),
  };

  const userForClient = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  };

  return (
    <div className="bg-slate-50 pt-16 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <Link
          href={`/curso/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#1F3A2D]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar ao curso
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          <section className="space-y-5">
            <header>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Finalizar compra
              </p>
              <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl">
                Pagamento seguro
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Escolha o metodo de pagamento e preencha seus dados para
                concluir a matricula.
              </p>
            </header>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <CheckoutForm
                course={courseForClient}
                user={userForClient}
                gatewayName={activeGateway}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    Pagamento seguro
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Dados criptografados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Award className="h-4 w-4 shrink-0 text-[#C9A227] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    Garantia de 7 dias
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Reembolso total
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Clock className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    Acesso imediato
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Apos confirmacao
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {course.isPremium && (
                  <div className="absolute left-3 top-3 inline-flex items-center rounded-md bg-[#C9A227] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1F3A2D]">
                    Premium
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {course.category && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: course.category.color ?? "#1F3A2D",
                      }}
                    />
                    <span className="text-slate-500">
                      {course.category.name}
                    </span>
                  </div>
                )}

                <h2 className="font-montserrat font-bold text-[#1F3A2D] leading-tight">
                  {course.title}
                </h2>

                <p className="text-xs text-slate-500 line-clamp-3">
                  {course.shortDescription}
                </p>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F3A2D] text-[10px] font-bold text-white">
                    {course.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Instrutor
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {course.instructor.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-[10px] text-slate-500">
                  <span>{course.totalLessons} aulas</span>
                  <span>{formatDuration(course.totalDuration)}</span>
                  {course.averageRating > 0 && (
                    <span>{course.averageRating.toFixed(1)} estrelas</span>
                  )}
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Total
                  </p>
                  <p className="font-montserrat text-3xl font-bold text-[#1F3A2D]">
                    {formatPrice(course.price.toNumber())}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pagamento unico, acesso vitalicio
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";