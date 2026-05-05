import Link from "next/link";
import { ArrowLeft, UserCog, Eye } from "lucide-react";
import { requireInstructor } from "@/lib/auth/instructor";
import { db } from "@/lib/db";
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";

export default async function InstructorProfilePage() {
  const sessionUser = await requireInstructor();

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      crm: true,
      bio: true,
      avatar: true,
    },
  });

  if (!user) {
    return null;
  }

  const initial = {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    crm: user.crm ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
  };

  const initials = (initial.name || "I").charAt(0).toUpperCase();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/instrutor"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#1E5A8C]"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para o painel
      </Link>

      <header className="mt-3 mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E5A8C]">
          Conta
        </p>
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#1F3A2D] sm:text-3xl inline-flex items-center gap-2">
          <UserCog className="h-6 w-6 text-[#1E5A8C]" />
          Meu perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Atualize suas informacoes publicas. Elas aparecem nas paginas dos seus cursos.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
          <InstructorProfileForm initial={initial} />
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700">
                Como aparece nos cursos
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                {initial.avatar ? (
                  <img
                    src={initial.avatar}
                    alt={initial.name}
                    className="h-14 w-14 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: "#1E5A8C" }}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1F3A2D] truncate">
                    {initial.name || "Seu nome"}
                  </p>
                  {initial.crm && (
                    <p className="text-[10px] text-slate-500 truncate">
                      CRM {initial.crm}
                    </p>
                  )}
                </div>
              </div>

              {initial.bio ? (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {initial.bio}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Sua bio aparecera aqui. Adicione uma descricao curta sobre sua experiencia e formacao.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Dicas</h3>
            <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>Use uma foto profissional, de frente e bem iluminada.</li>
              <li>Mantenha a bio entre 2 e 4 linhas — destaque formacao e especialidade.</li>
              <li>O CRM aumenta a confianca dos alunos.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";