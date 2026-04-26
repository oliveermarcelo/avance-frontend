import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Avance MentorMed
          </p>
          <h1 className="text-5xl font-bold text-primary">
            Plataforma em construção
          </h1>
          <p className="text-muted-foreground">
            Validando a paleta de cores e tipografia.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-square rounded-xl bg-primary flex items-end p-4">
            <div>
              <p className="text-primary-foreground font-semibold text-sm">Primary</p>
              <p className="text-primary-foreground/70 text-xs">Verde-musgo</p>
            </div>
          </div>
          <div className="aspect-square rounded-xl bg-accent flex items-end p-4">
            <div>
              <p className="text-accent-foreground font-semibold text-sm">Accent</p>
              <p className="text-accent-foreground/70 text-xs">Dourado</p>
            </div>
          </div>
          <div className="aspect-square rounded-xl bg-background border border-border flex items-end p-4">
            <div>
              <p className="text-foreground font-semibold text-sm">Background</p>
              <p className="text-muted-foreground text-xs">Branco</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button>Botão primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="bg-sidebar rounded-xl p-6 text-center">
          <p className="text-sidebar-foreground font-semibold mb-2">Sidebar preview</p>
          <p className="text-sidebar-foreground/70 text-sm">
            Esta área simula a sidebar do app
          </p>
          <Button variant="default" className="mt-4">
            CTA na sidebar
          </Button>
        </div>
      </div>
    </div>
  );
}