import Link from "next/link";
import { Stethoscope, Bell } from "lucide-react";
import { InstructorSidebarNav } from "./instructor-sidebar-nav";
import { InstructorUserMenu } from "./instructor-user-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationBell } from "@/components/avance/notification-bell";
import { getCurrentUser, getUserInitials } from "@/lib/data/user";

export async function InstructorSidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1F3A2D] text-white">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        <Link
          href="/instrutor"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 min-w-0 flex-1"
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
        <NotificationBell variant="dark" />
      </div>

      <ScrollArea className="flex-1">
        <InstructorSidebarNav />
      </ScrollArea>

      <InstructorUserMenu
        name={user.name}
        email={user.email}
        crm={user.crm}
        avatar={user.avatar}
        initials={getUserInitials(user.name)}
      />
    </aside>
  );
}