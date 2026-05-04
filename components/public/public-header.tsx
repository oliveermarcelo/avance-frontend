"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, ArrowRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicHeaderProps {
  userName: string | null;
  userRole: "STUDENT" | "INSTRUCTOR" | "ADMIN" | null;
}

const navLinks = [
  { label: "Cursos", href: "/cursos-publicos" },
  { label: "Sobre", href: "/#beneficios" },
  { label: "Contato", href: "/#contato" },
];

const HERO_ROUTES = ["/"];

export function PublicHeader({ userName, userRole }: PublicHeaderProps) {
  const pathname = usePathname();
  const isHeroRoute = HERO_ROUTES.includes(pathname);
  const [scrolled, setScrolled] = useState(!isHeroRoute);

  useEffect(() => {
    if (!isHeroRoute) {
      setScrolled(true);
      return;
    }
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isHeroRoute]);

  const isLoggedIn = !!userName;
  const dashboardHref = userRole === "ADMIN" ? "/admin" : "/inicio";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors shrink-0",
              scrolled ? "bg-[#1F3A2D]" : "bg-white"
            )}
          >
            <Stethoscope
              className={cn(
                "h-4 w-4",
                scrolled ? "text-white" : "text-[#1F3A2D]"
              )}
              strokeWidth={2.5}
            />
          </div>
          <span
            className={cn(
              "hidden font-bold text-lg tracking-tight transition-colors font-montserrat sm:inline",
              scrolled ? "text-[#1F3A2D]" : "text-white"
            )}
          >
            Avance MentorMed
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors whitespace-nowrap",
                scrolled
                  ? "text-slate-700 hover:text-[#1F3A2D]"
                  : "text-white/90 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              <span
                className={cn(
                  "hidden text-xs font-medium lg:block",
                  scrolled ? "text-slate-600" : "text-white/80"
                )}
              >
                Ola, {userName.split(" ")[0]}
              </span>
              <Link
                href={dashboardHref}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors whitespace-nowrap sm:px-4",
                  scrolled
                    ? "bg-[#1F3A2D] text-white hover:bg-[#163024]"
                    : "bg-white text-[#1F3A2D] hover:bg-[#C9A227]"
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ir para a plataforma</span>
                <span className="sm:hidden">Plataforma</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors whitespace-nowrap sm:px-4",
                  scrolled
                    ? "text-slate-700 hover:bg-slate-100 hover:text-[#1F3A2D]"
                    : "text-white hover:bg-white/10"
                )}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors whitespace-nowrap sm:gap-2 sm:px-4",
                  scrolled
                    ? "bg-[#1F3A2D] text-white hover:bg-[#163024]"
                    : "bg-white text-[#1F3A2D] hover:bg-[#C9A227]"
                )}
              >
                <span className="sm:hidden">Cadastrar</span>
                <span className="hidden sm:inline">Comecar agora</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}