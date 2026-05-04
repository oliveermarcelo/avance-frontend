import { Sidebar } from "@/components/avance/sidebar";
import { MobileAppBar } from "@/components/avance/mobile-app-bar";
import { SidebarProvider } from "@/components/avance/sidebar-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background lg:h-screen lg:overflow-hidden">
        <MobileAppBar />
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}