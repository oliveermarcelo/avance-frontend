import { InstructorSidebar } from "@/components/instructor/instructor-sidebar";
import { requireInstructor } from "@/lib/auth/instructor";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInstructor();

  return (
    <div className="flex h-screen bg-slate-50">
      <InstructorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}