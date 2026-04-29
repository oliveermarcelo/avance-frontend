import { UsersTable } from "@/components/admin/users-table";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserInitials } from "@/lib/data/user";

async function getAllUsers() {
  const users = await db.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      crm: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } } },
          taughtCourses: { where: { deletedAt: null } },
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    crm: u.crm,
    avatar: u.avatar,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    initials: getUserInitials(u.name),
    enrollmentCount: u._count.enrollments,
    taughtCount: u._count.taughtCourses,
  }));
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAllUsers();

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    students: users.filter((u) => u.role === "STUDENT").length,
    instructors: users.filter((u) => u.role === "INSTRUCTOR").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Pessoas
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>{stats.total} usuarios</span>
          <span>·</span>
          <span>{stats.active} ativos</span>
          <span>·</span>
          <span>{stats.students} alunos</span>
          <span>·</span>
          <span>{stats.instructors} instrutores</span>
          <span>·</span>
          <span>{stats.admins} admins</span>
        </div>
      </header>

      <UsersTable users={users} currentUserId={admin.id} />
    </div>
  );
}

export const dynamic = "force-dynamic";