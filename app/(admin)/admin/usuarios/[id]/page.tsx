import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserInitials, getRoleLabel } from "@/lib/data/user";
import { UserEditForm } from "@/components/admin/user-edit-form";
import { UserPasswordReset } from "@/components/admin/user-password-reset";

async function getUserDetails(id: string) {
  const user = await db.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      crm: true,
      bio: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        orderBy: { lastAccessAt: "desc" },
        take: 10,
        include: {
          course: { select: { id: true, slug: true, title: true } },
        },
      },
      taughtCourses: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          isPublished: true,
          enrollmentCount: true,
        },
      },
    },
  });

  return user;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  const user = await getUserDetails(id);

  if (!user) notFound();

  const isSelf = user.id === admin.id;

  const userForForm = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    crm: user.crm,
    bio: user.bio,
    role: user.role,
  };

  return (
    <div className="px-8 py-8">
      <header className="mb-6 space-y-3">
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para usuarios
        </Link>

        <div className="flex items-center gap-4">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
              {getUserInitials(user.name)}
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Editar usuario
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </span>
              {user.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </span>
              )}
              {user.crm && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {user.crm}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Cadastro em {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <UserEditForm user={userForForm} isSelf={isSelf} />
          <UserPasswordReset userId={user.id} userName={user.name} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && user.taughtCourses.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <header className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Cursos lecionados ({user.taughtCourses.length})
                </h3>
              </header>
              <ul className="space-y-2">
                {user.taughtCourses.map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/admin/cursos/${course.id}`}
                      className="block rounded-md bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">
                        {course.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>
                          {course.enrollmentCount}{" "}
                          {course.enrollmentCount === 1 ? "aluno" : "alunos"}
                        </span>
                        <span>·</span>
                        <span
                          className={
                            course.isPublished
                              ? "font-bold uppercase tracking-wider text-emerald-700"
                              : "font-bold uppercase tracking-wider text-slate-500"
                          }
                        >
                          {course.isPublished ? "Publicado" : "Rascunho"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {user.role === "STUDENT" && user.enrollments.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <header className="mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Matriculas ({user.enrollments.length})
                </h3>
              </header>
              <ul className="space-y-2">
                {user.enrollments.map((enrollment) => (
                  <li key={enrollment.id}>
                    <Link
                      href={`/admin/cursos/${enrollment.course.id}`}
                      className="block rounded-md bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">
                        {enrollment.course.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-slate-700"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <header className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Status da conta
              </h3>
            </header>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Papel</span>
                <span className="font-medium text-slate-900">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={
                    user.isActive
                      ? "font-medium text-emerald-700"
                      : "font-medium text-slate-500"
                  }
                >
                  {user.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";