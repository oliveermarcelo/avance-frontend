"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarShellProps {
  children: React.ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o drawer ao navegar
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fecha com tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <>
      {/* Botao hambuguer mobile - fica fixo no topo */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
        className={cn(
          "fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md bg-sidebar/95 text-sidebar-foreground shadow-lg backdrop-blur transition-opacity lg:hidden",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop mobile */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Container da sidebar - fixo no mobile, estatico no desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:transform-none lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Botao fechar - so mobile, dentro da sidebar */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fechar menu"
          className="absolute right-3 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </>
  );
}