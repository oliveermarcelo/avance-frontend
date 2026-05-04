import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPreviewLesson } from "@/lib/data/preview-lesson";
import { PreviewLessonSidebar } from "@/components/public/preview-lesson-sidebar";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function PreviewLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const session = await auth();
  if (session?.user?.id) {
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        course: { slug },
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    });
    if (enrollment) {
      redirect(`/aprender/${slug}/aula/${lessonId}`);
    }
  }

  const data = await getPreviewLesson(slug, lessonId);
  if (!data) notFound();

  const { course, lesson } = data;

  return (
    <div className="bg-slate-50 min-h-screen pt-16">
      <div className="sticky top-16 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Aula de demonstracao
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-[#1F3A2D]">
                {course.title}
              </p>
            </div>
            <Link
              href={`/curso/${slug}`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar preview"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <main className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-md">
              {lesson.videoUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={lesson.videoUrl}
                  controls
                  className="aspect-video w-full"
                  poster={course.thumbnail ?? undefined}
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-slate-900 text-slate-500">
                  <p className="text-sm">Video nao disponivel</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white">
                  <Lock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    Esta e uma aula de demonstracao
                  </p>
                  <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                    Compre o curso completo para acessar todas as{" "}
                    {course.totalLessons} aulas, certificado e suporte direto
                    com o instrutor.
                  </p>
                  <Link
                    href={`/checkout/${slug}`}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#C9A227] px-5 text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A]"
                  >
                    Comprar curso por {formatPrice(course.price)}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <header className="border-b border-slate-100 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                  Modulo {String(lesson.module.order + 1).padStart(2, "0")} ·
                  Aula {String(lesson.order + 1).padStart(2, "0")}
                </p>
                <h1 className="mt-1 font-montserrat text-xl font-bold text-[#1F3A2D] sm:text-2xl">
                  {lesson.title}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  {lesson.module.title}
                </p>
              </header>

              {lesson.description && (
                <div className="mt-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Sobre esta aula
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    7 dias de garantia
                  </p>
                  <p className="text-[10px] text-slate-500">Reembolso total</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Award className="h-4 w-4 shrink-0 text-[#C9A227] mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    Certificado oficial
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ao concluir o curso
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <ArrowRight className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">
                    Acesso imediato
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Apos o pagamento
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#1F3A2D] to-[#234433] p-6 text-white text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Pronto para continuar
              </p>
              <h3 className="mt-2 font-montserrat text-2xl font-bold">
                Adquira o curso completo
              </h3>
              <p className="mt-2 text-sm text-white/80">
                Acesso vitalicio a {course.totalLessons} aulas com{" "}
                {course.instructor.name}
              </p>
              <Link
                href={`/checkout/${slug}`}
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#C9A227] px-6 text-sm font-bold text-[#1F3A2D] transition hover:bg-[#B8932A]"
              >
                Comprar por {formatPrice(course.price)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </main>

          <PreviewLessonSidebar
            courseSlug={slug}
            currentLessonId={lessonId}
            modules={course.modules}
          />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";