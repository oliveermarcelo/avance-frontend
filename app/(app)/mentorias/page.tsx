import { Users, Calendar, MessageCircle } from "lucide-react";
import { Header } from "@/components/avance/header";

export default function MentoriasPage() {
  return (
    <>
      <Header subtitle="Aprenda direto com especialistas" title="Mentorias" />

      <div className="px-8 py-8">
        <div className="rounded-2xl bg-primary p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/5" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Em breve
            </p>
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              Mentorias 1-a-1 com especialistas
            </h2>
            <p className="text-primary-foreground/70 leading-relaxed">
              Em breve você poderá agendar sessões individuais com nossos instrutores
              para tirar dúvidas, discutir casos clínicos e acelerar sua aprendizagem.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">Encontros 1-a-1</h3>
            <p className="text-sm text-muted-foreground">
              Sessões privativas com especialistas para discussão de casos.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">Agenda flexível</h3>
            <p className="text-sm text-muted-foreground">
              Marque suas mentorias nos horários que melhor cabem na sua rotina.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary">Acompanhamento</h3>
            <p className="text-sm text-muted-foreground">
              Histórico completo de suas mentorias e materiais discutidos.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}