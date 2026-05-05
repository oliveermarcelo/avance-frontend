import Link from "next/link";
import { Award, Download, ExternalLink } from "lucide-react";
import { Header } from "@/components/avance/header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data/user";
import { getUserCertificates } from "@/lib/data/certificates";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CertificadosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const certificates = await getUserCertificates(user.id);

  return (
    <>
      <Header subtitle="Suas conquistas" title="Certificados" />

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {certificates.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <article
                key={cert.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent hover:shadow-lg"
              >
                <div className="relative aspect-[3/2] bg-gradient-to-br from-primary to-primary/70 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <Award className="h-10 w-10 text-accent" strokeWidth={1.5} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                      Certificado
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">
                      Concluído em
                    </p>
                    <p className="text-sm font-semibold text-primary-foreground">
                      {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                      Curso
                    </p>
                    <h3 className="font-bold text-primary leading-snug line-clamp-2 min-h-[2.6em]">
                      {cert.enrollment.course.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Nº {cert.number}</span>
                    <Link
                      href={`/validar/${cert.validationCode}`}
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Validar <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {cert.pdfUrl && (
                    <Button asChild className="w-full" size="sm">
                      <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Award className="h-8 w-8 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">
                Você ainda não tem certificados
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Complete os cursos em que está matriculado para receber seus certificados de conclusão.
              </p>
            </div>
            <Button asChild>
              <Link href="/meus-cursos">Ver meus cursos</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";