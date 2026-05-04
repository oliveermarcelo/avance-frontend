import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getPublicSession } from "@/lib/auth/public-session";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getPublicSession();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader
        userName={user?.name ?? null}
        userRole={user?.role ?? null}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}