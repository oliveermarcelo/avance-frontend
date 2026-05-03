import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserInitials } from "@/lib/data/user";
import { EnrollmentsTable } from "@/components/admin/enrollments-table";
import { EnrollStudentButton } from "@/components/admin/enroll-student-button";

async function getEnrollmentsData() {
  const [enrollments, courses, students] = await Promise.all([
    db.enrollment.findMany({
      orderBy: [{ enrolledAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
    db.course.findMany({
      where: { deletedAt: null },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true, isPublished: true },
    }),
    db.user.findMany({
      where: { role: "STUDENT", isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, avatar: true },
    }),
  ]);

  const enrollmentsForTable = enrollments.map((e) => ({
    id: e.id,
    status: e.status,
    progress: e.progress,
    enrolledAt: e.enrolledAt.toISOString(),
    lastAccessAt: e.lastAccessAt?.toISOString() ?? null,
    expiresAt: e.expiresAt?.toISOString() ?? null,
    userName: e.user.name,
    userEmail: e.user.email,
    userInitials: getUserInitials(e.user.name),
    userAvatar: e.user.avatar,
    courseTitle: e.course.title,
    courseId: e.course.id,
    courseSlug: e.course.slug,
  }));

  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    isPublished: c.isPublished,
  }));

  const studentOptions = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar,
    initials: getUserInitials(s.name),
  }));

  return { enrollments: enrollmentsForTable, courses: courseOptions, students: studentOptions };
}

export default async function AdminEnrollmentsPage() {
  await requireAdmin();
  const { enrollments, courses, students } = await getEnrollmentsData();

  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e) => e.status === "ACTIVE").length,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    cancelled: enrollments.filter((e) => e.status === "CANCELLED").length,
    expired: enrollments.filter((e) => e.status === "EXPIRED").length,
  };

  return (
    <div className="px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Pessoas
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Matriculas</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{stats.total} matriculas</span>
            <span>·</span>
            <span>{stats.active} ativas</span>
            <span>·</span>
            <span>{stats.completed} concluidas</span>
            {stats.cancelled > 0 && (
              <>
                <span>·</span>
                <span>{stats.cancelled} canceladas</span>
              </>
            )}
            {stats.expired > 0 && (
              <>
                <span>·</span>
                <span>{stats.expired} expiradas</span>
              </>
            )}
          </div>
        </div>

        <EnrollStudentButton students={students} courses={courses} />
      </header>

      <EnrollmentsTable enrollments={enrollments} courses={courses.filter((c) => c.isPublished)} />
    </div>
  );
}

export const dynamic = "force-dynamic";