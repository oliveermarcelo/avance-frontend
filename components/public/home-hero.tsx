import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#1F3A2D] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute right-0 top-32 h-[500px] w-[500px] rounded-full bg-[#C9A227] opacity-[0.08] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-40 lg:px-8 lg:pt-52">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
              <GraduationCap className="h-3 w-3" />
              Educacao medica de elite
            </div>

            <h1 className="font-montserrat text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Domine o que importa.
              <br />
              <span className="text-[#C9A227]">Avance na sua carreira.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-white/80">
              Plataforma premium de educacao continuada para profissionais
              da saude que buscam excelencia. Cursos com especialistas
              reconhecidos, metodologia comprovada e certificacao oficial.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#C9A227] text-[#1F3A2D] hover:bg-[#B8932A] font-semibold"
              >
                <Link href="/cadastro">
                  Comece agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:text-white"
              >
                <Link href="/cursos-publicos">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Ver cursos
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4">
              <div className="inline-flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
                Certificacao reconhecida
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
                7 dias de garantia
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
                Suporte direto com instrutor
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#C9A227]/20 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-[#2D503E] to-[#1F3A2D]">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A227]">
                      Em destaque
                    </p>
                    <h3 className="font-montserrat text-2xl font-bold leading-tight">
                      Harmonizacao Facial Avancada
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Tecnicas modernas com Dr. Roberto Silva.
                      11 aulas, 6 horas de conteudo.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="h-7 w-7 rounded-full border-2 border-[#1F3A2D] bg-blue-400" />
                        <div className="h-7 w-7 rounded-full border-2 border-[#1F3A2D] bg-rose-400" />
                        <div className="h-7 w-7 rounded-full border-2 border-[#1F3A2D] bg-amber-400" />
                      </div>
                      <p className="text-xs text-white/70">+450 alunos</p>
                    </div>

                    <div className="flex items-end justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/50">
                          Investimento
                        </p>
                        <p className="font-montserrat text-2xl font-bold">
                          R$ 4.997
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#C9A227]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}