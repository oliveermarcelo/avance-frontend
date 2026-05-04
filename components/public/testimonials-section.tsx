import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "A profundidade tecnica e a qualidade dos casos clinicos apresentados sao impressionantes. Mudou completamente minha pratica diaria.",
    name: "Dra. Camila Ferreira",
    role: "Dermatologista, Sao Paulo",
    rating: 5,
    initials: "CF",
    avatarColor: "bg-rose-500",
  },
  {
    quote:
      "Investi em varios cursos online ao longo da carreira. Avance tem o melhor custo-beneficio que ja vi. Conteudo aplicavel desde a primeira aula.",
    name: "Dr. Marcelo Andrade",
    role: "Medico esportivo, Rio de Janeiro",
    rating: 5,
    initials: "MA",
    avatarColor: "bg-blue-500",
  },
  {
    quote:
      "O suporte direto com o instrutor faz toda a diferenca. Tirei duvidas reais sobre meus pacientes. Isso nao tem preco.",
    name: "Dr. Pedro Mendes",
    role: "Cirurgiao plastico, Belo Horizonte",
    rating: 5,
    initials: "PM",
    avatarColor: "bg-emerald-500",
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
            Depoimentos
          </p>
          <h2 className="mt-2 font-montserrat text-3xl font-bold text-[#1F3A2D] sm:text-4xl">
            Profissionais que ja avancaram
          </h2>
          <p className="mt-3 text-slate-600">
            Histo das de quem encontrou na nossa plataforma um caminho real
            de evolucao profissional.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="relative rounded-2xl border border-slate-200 bg-white p-7"
            >
              <Quote
                className="absolute right-6 top-6 h-8 w-8 text-[#C9A227]/20"
                strokeWidth={1.5}
              />

              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#C9A227] text-[#C9A227]"
                  />
                ))}
              </div>

              <blockquote className="text-sm leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.avatarColor}`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#1F3A2D]">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}