import { LifeBuoy, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Header } from "@/components/avance/header";

const faqs = [
  {
    question: "Como acesso meus cursos?",
    answer:
      "Apos fazer login, va em Meus Cursos no menu lateral. La voce encontra todos os cursos em que esta matriculado.",
  },
  {
    question: "Como funciona a emissao de certificado?",
    answer:
      "O certificado e gerado automaticamente apos voce concluir 100 por cento das aulas. Voce pode baixa-lo em PDF na secao Certificados.",
  },
  {
    question: "Posso assistir as aulas no celular?",
    answer:
      "Sim! A plataforma e totalmente responsiva. Voce pode assistir em qualquer dispositivo.",
  },
  {
    question: "Como contato o suporte?",
    answer:
      "Voce pode entrar em contato pelo e-mail suporte@avance.com.br ou pelo WhatsApp.",
  },
];

export default function AjudaPage() {
  return (
    <>
      <Header subtitle="Estamos aqui pra ajudar" title="Central de ajuda" />

      <div className="px-8 py-8 space-y-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <a
            href="mailto:suporte@avance.com.br"
            className="rounded-xl border border-border bg-card p-6 space-y-3 transition-all hover:border-accent hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">E-mail</h3>
            <p className="text-sm text-muted-foreground">suporte@avance.com.br</p>
          </a>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">Documentacao</h3>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-accent" />
            <h2 className="text-base font-bold text-primary">Perguntas frequentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-primary">
                  {faq.question}
                  <span className="text-accent transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}