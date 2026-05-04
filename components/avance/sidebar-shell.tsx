"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

interface SidebarShellProps {
  children: React.ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:transform-none lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          type="button"
          onClick={close}
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