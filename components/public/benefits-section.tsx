import {
  Award,
  Users,
  PlayCircle,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "Especialistas reconhecidos",
    description:
      "Aulas com instrutores referencia em suas areas, com formacao solida e experiencia clinica comprovada.",
  },
  {
    icon: ShieldCheck,
    title: "Certificacao oficial",
    description:
      "Receba certificado ao concluir cada curso. Inclua no seu curriculo e na sua estante de credenciais.",
  },
  {
    icon: PlayCircle,
    title: "Acesso vitalicio",
    description:
      "Compre uma vez, assista quando e onde quiser. Sem mensalidades, sem prazos limitantes.",
  },
  {
    icon: Sparkles,
    title: "Conteudo premium",
    description:
      "Producao audiovisual de alta qualidade, materiais complementares e casos clinicos reais.",
  },
  {
    icon: Users,
    title: "Comunidade exclusiva",
    description:
      "Acesso a grupo de discussao com colegas de profissao e dialogo direto com os instrutores.",
  },
  {
    icon: Clock,
    title: "Estude no seu ritmo",
    description:
      "Plataforma intuitiva com player avancado, marcacoes, anotacoes e progresso automatico.",
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
            Por que Avance
          </p>
          <h2 className="mt-2 font-montserrat text-3xl font-bold text-[#1F3A2D] sm:text-4xl">
            Educacao continuada com a profundidade que sua carreira merece
          </h2>
          <p className="mt-3 text-slate-600">
            Mais que cursos. Uma experiencia de aprendizado pensada para
            profissionais que valorizam excelencia, profundidade tecnica e
            aplicabilidade clinica imediata.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1F3A2D]/30 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-[#1F3A2D] to-[#2D503E] text-white transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-montserrat text-base font-bold text-[#1F3A2D]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}