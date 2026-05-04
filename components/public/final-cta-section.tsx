import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section id="contato" className="relative isolate overflow-hidden bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F3A2D] via-[#234433] to-[#1F3A2D] p-10 lg:p-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-[#C9A227]/15 blur-3xl" />
            <div className="absolute -bottom-20 left-0 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
                <Sparkles className="h-3 w-3" />
                Comece sua jornada
              </div>

              <h2 className="font-montserrat text-3xl font-bold leading-tight sm:text-4xl">
                Pronto para avancar
                <br />
                <span className="text-[#C9A227]">na sua carreira?</span>
              </h2>

              <p className="max-w-xl text-base leading-relaxed text-white/80">
                Crie sua conta gratuita e descubra cursos selecionados pelos melhores
                especialistas da medicina e ciencias da saude. Sem mensalidades,
                sem compromisso.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#C9A227] text-[#1F3A2D] hover:bg-[#B8932A] font-semibold"
                >
                  <Link href="/cadastro">
                    Criar conta gratuita
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white backdrop-blur hover:bg-white/10 hover:text-white"
                >
                  <Link href="/cursos-publicos">
                    Explorar cursos
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="space-y-3">
                {[
                  "Acesso vitalicio a todo conteudo adquirido",
                  "Certificado oficial ao concluir",
                  "Suporte direto com instrutores",
                  "Comunidade exclusiva de profissionais",
                  "7 dias de garantia incondicional",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A227]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="h-3 w-3 text-[#1F3A2D]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-sm text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}