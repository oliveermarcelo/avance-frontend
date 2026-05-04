import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { AdminSidebarNav } from "./admin-sidebar-nav";
import { AdminUserMenu } from "./admin-user-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationBell } from "@/components/avance/notification-bell";
import { getCurrentUser, getUserInitials } from "@/lib/data/user";

export async function AdminSidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900">
            <Stethoscope className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Avance Admin</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Painel de gestao
            </p>
          </div>
        </div>
        <NotificationBell variant="light" />
      </div>

      <ScrollArea className="flex-1">
        <AdminSidebarNav />
      </ScrollArea>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/inicio"
          className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a plataforma
        </Link>
      </div>

      <AdminUserMenu
        name={user.name}
        email={user.email}
        avatar={user.avatar}
        initials={getUserInitials(user.name)}
      />
    </aside>
  );
}