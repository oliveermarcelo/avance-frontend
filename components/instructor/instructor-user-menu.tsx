"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserCog } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

interface InstructorUserMenuProps {
  name: string;
  email: string;
  crm?: string | null;
  avatar?: string | null;
  initials: string;
}

export function InstructorUserMenu({
  name,
  email,
  crm,
  avatar,
  initials,
}: InstructorUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative border-t border-white/10 p-3">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 transition hover:bg-white/5"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E5A8C] text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-xs font-bold text-white">{name}</p>
          <p className="truncate text-[10px] text-white/60">
            {crm ? `CRM ${crm}` : email}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
          <Link
            href="/instrutor/perfil"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            <UserCog className="h-3.5 w-3.5" />
            Meu perfil
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}