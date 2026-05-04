import { SignupForm } from "./signup-form";

export default function CadastroPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
          Crie sua conta
        </p>
        <h2 className="font-montserrat text-3xl font-bold text-[#1F3A2D]">
          Vamos comecar
        </h2>
        <p className="text-sm text-slate-500">
          Preencha os dados abaixo. Leva menos de 1 minuto.
        </p>
      </header>

      <SignupForm />
    </div>
  );
}