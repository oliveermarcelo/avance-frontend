import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { SidebarShell } from "./sidebar-shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMenu } from "./user-menu";
import { getCurrentUser, getUserInitials, getRoleLabel } from "@/lib/data/user";

export async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <SidebarShell>
      <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link
          href="/inicio"
          className="flex items-center gap-3 border-b border-sidebar-border/50 px-5 py-5 pr-12 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">Avance MentorMed</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-primary">
              Premium
            </span>
          </div>
        </Link>

        <ScrollArea className="flex-1">
          <SidebarNav />
        </ScrollArea>

        <UserMenu
          name={user.name}
          crm={user.crm}
          avatar={user.avatar}
          roleLabel={getRoleLabel(user.role)}
          initials={getUserInitials(user.name)}
        />
      </aside>
    </SidebarShell>
  );
}