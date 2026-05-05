import { InstructorSidebar } from "@/components/instructor/instructor-sidebar";
import { InstructorMobileNav } from "@/components/instructor/instructor-mobile-nav";
import { requireInstructor } from "@/lib/auth/instructor";
import { getCurrentUser, getUserInitials } from "@/lib/data/user";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInstructor();
  const user = await getCurrentUser();
  if (!user) return null;

  const userProps = {
    name: user.name,
    email: user.email,
    crm: user.crm,
    avatar: user.avatar,
    initials: getUserInitials(user.name),
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-slate-50">
      <InstructorSidebar user={userProps} />
      <div className="flex flex-1 flex-col min-w-0 lg:overflow-hidden">
        <InstructorMobileNav user={userProps} />
        <main className="flex-1 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}