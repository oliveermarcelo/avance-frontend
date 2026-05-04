import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Cadastro gratuito e rapido. Em menos de 1 minuto voce ja tera acesso ao catalogo completo de cursos.",
  },
  {
    number: "02",
    title: "Escolha seu curso",
    description:
      "Navegue por categorias, leia descricoes detalhadas, conheca os instrutores e selecione o conteudo ideal.",
  },
  {
    number: "03",
    title: "Estude no seu ritmo",
    description:
      "Acesse imediatamente apos a compra. Player avancado, anotacoes por aula, certificado ao concluir.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="relative isolate overflow-hidden bg-[#1F3A2D] py-20 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.1),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
            Simples e direto
          </p>
          <h2 className="mt-2 font-montserrat text-3xl font-bold sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-white/70">
            Tres passos para comecar a evoluir sua carreira hoje mesmo.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <article
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="font-montserrat text-5xl font-bold text-[#C9A227] leading-none">
                  {step.number}
                </span>
                {idx < steps.length - 1 && (
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-[#C9A227]/40 to-transparent lg:block" />
                )}
              </div>

              <h3 className="font-montserrat text-xl font-bold">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
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
        </div>
      </div>
    </section>
  );
}