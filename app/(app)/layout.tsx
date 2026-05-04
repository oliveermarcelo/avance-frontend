import { Sidebar } from "@/components/avance/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}