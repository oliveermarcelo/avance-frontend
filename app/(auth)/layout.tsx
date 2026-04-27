import { Stethoscope } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/10" />
        <div className="absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-accent/5" />

        <Link href="/" className="relative flex items-center gap-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
            <Stethoscope className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold">Avance MentorMed</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Premium
            </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-md space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            Plataforma de cursos médicos
          </p>
          <h2 className="text-3xl font-bold leading-tight">
            Conhecimento que transforma sua prática clínica.
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Cursos exclusivos com os melhores especialistas, mentorias e certificação reconhecida.
          </p>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/50">
          © 2026 Avance MentorMed. Todos os direitos reservados.
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}