"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  MessageSquare,
  BarChart3,
  Wallet,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/instrutor", label: "Visao geral", icon: LayoutDashboard, exact: true },
  { href: "/instrutor/cursos", label: "Meus cursos", icon: GraduationCap },
  { href: "/instrutor/alunos", label: "Alunos", icon: Users },
  { href: "/instrutor/perguntas", label: "Perguntas", icon: MessageSquare },
  { href: "/instrutor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/instrutor/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/instrutor/perfil", label: "Meu perfil", icon: UserCog },
];

export function InstructorSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="px-3 py-4 space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition border-l-2",
              isActive
                ? "border-[#1E5A8C] bg-white/5 text-white font-semibold"
                : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}