import Link from "next/link";
import { Stethoscope, Mail, MapPin, Globe } from "lucide-react";

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { label: "Catalogo de cursos", href: "/cursos-publicos" },
      { label: "Para profissionais", href: "/#beneficios" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Depoimentos", href: "/#depoimentos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Cadastrar", href: "/cadastro" },
      { label: "Recuperar senha", href: "/recuperar-senha" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de ajuda", href: "/#contato" },
      { label: "Politica de privacidade", href: "/privacidade" },
      { label: "Termos de uso", href: "/termos" },
      { label: "Reembolsos", href: "/reembolsos" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/avancementormed", initial: "IG" },
  { label: "LinkedIn", href: "https://linkedin.com/company/avancementormed", initial: "IN" },
  { label: "YouTube", href: "https://youtube.com/@avancementormed", initial: "YT" },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#0F1F18] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#C9A227]">
                <Stethoscope className="h-5 w-5 text-[#1F3A2D]" strokeWidth={2.5} />
              </div>
              <span className="font-montserrat font-bold text-xl tracking-tight">
                Avance MentorMed
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Plataforma premium de educacao continuada para profissionais da saude.
              Cursos com especialistas reconhecidos, certificacao oficial e
              metodologia de excelencia.
            </p>

            <div className="space-y-2 text-xs text-white/60">
              <div className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>contato@avancementormed.com.br</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Sao Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Avance MentorMed. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 mr-1">
              <Globe className="h-3 w-3" />
              Siga-nos
            </span>
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-white/5 px-2.5 text-[10px] font-bold tracking-wider transition-colors hover:bg-[#C9A227] hover:text-[#1F3A2D]"
              >
                {social.initial}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}