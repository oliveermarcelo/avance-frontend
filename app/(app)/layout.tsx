import { Sidebar } from "@/components/avance/sidebar";
import { MobileAppBarRouteAware } from "@/components/avance/mobile-app-bar-route-aware";
import { AppMain } from "@/components/avance/app-main";
import { SidebarProvider } from "@/components/avance/sidebar-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background lg:h-screen lg:overflow-hidden">
        <MobileAppBarRouteAware />
        <Sidebar />
        <AppMain>{children}</AppMain>
      </div>
    </SidebarProvider>
  );
}