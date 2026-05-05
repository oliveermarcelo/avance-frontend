"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Stethoscope } from "lucide-react";
import { InstructorSidebarNav } from "./instructor-sidebar-nav";
import { InstructorUserMenu } from "./instructor-user-menu";
import { NotificationBell } from "@/components/avance/notification-bell";

interface Props {
  user: {
    name: string;
    email: string;
    crm: string | null;
    avatar: string | null;
    initials: string;
  };
}

export function InstructorMobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-[#1F3A2D] text-white border-b border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="p-1 -ml-1 rounded-md hover:bg-white/10 transition"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/instrutor"
            className="flex items-center gap-2 min-w-0 flex-1"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1E5A8C]">
              <Stethoscope
                className="h-3.5 w-3.5 text-white"
                strokeWidth={2.5}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Avance MentorMed</p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#7DB1D9]">
                Painel do instrutor
              </p>
            </div>
          </Link>
          <NotificationBell variant="dark" />
        </div>
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1F3A2D] text-white shadow-xl flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
          <Link
            href="/instrutor"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1E5A8C]">
              <Stethoscope className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Avance MentorMed</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7DB1D9]">
                Painel do instrutor
              </p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <InstructorSidebarNav />
        </div>
        <InstructorUserMenu
          name={user.name}
          email={user.email}
          crm={user.crm}
          avatar={user.avatar}
          initials={user.initials}
        />
      </aside>
    </>
  );
}