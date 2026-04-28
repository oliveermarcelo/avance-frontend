import { Mail, Phone, Award, Briefcase } from "lucide-react";
import { Header } from "@/components/avance/header";
import { getCurrentUser, getUserInitials, getRoleLabel } from "@/lib/data/user";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <>
      <Header subtitle="Seus dados" title="Meu perfil" />

      <div className="px-8 py-8 max-w-4xl space-y-6">
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/70 h-32 relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10" />
          </div>

          <div className="px-8 pb-8 -mt-12 relative">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 rounded-full border-4 border-card object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-accent text-accent-foreground text-xl font-bold">
                {getUserInitials(user.name)}
              </div>
            )}

            <div className="mt-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {getRoleLabel(user.role)}
              </p>
              <h2 className="text-2xl font-bold text-primary">{user.name}</h2>
              {user.bio && (
                <p className="text-sm text-muted-foreground max-w-2xl pt-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-8 space-y-5">
          <h3 className="text-base font-bold text-primary">Informações de contato</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  E-mail
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                <Phone className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Telefone
                </p>
                <p className="text-sm font-medium text-foreground">
                  {user.phone ?? "Não informado"}
                </p>
              </div>
            </div>

            {user.crm && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                  <Briefcase className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Registro profissional
                  </p>
                  <p className="text-sm font-medium text-foreground">{user.crm}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                <Award className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Tipo de conta
                </p>
                <p className="text-sm font-medium text-foreground">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Em breve você poderá editar suas informações e trocar de senha aqui.
          </p>
        </section>
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";