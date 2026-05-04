"use client";

import Link from "next/link";
import { Menu, Stethoscope } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { useSidebar } from "./sidebar-context";

export function MobileAppBar() {
  const { open } = useSidebar();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border/40 bg-sidebar px-3 text-sidebar-foreground shadow-md lg:hidden">
      <button
        type="button"
        onClick={open}
        aria-label="Abrir menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground/90 hover:bg-sidebar-accent/30 active:bg-sidebar-accent/50 transition"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        href="/inicio"
        className="flex items-center gap-2 transition-opacity hover:opacity-90"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
          <Stethoscope className="h-3.5 w-3.5 text-sidebar-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm tracking-tight">
          Avance <span className="text-sidebar-primary">MentorMed</span>
        </span>
      </Link>

      <NotificationBell variant="dark" />
    </header>
  );
}