import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserInitials } from "@/lib/data/user";
import { ReviewsList } from "@/components/admin/reviews-list";

async function getReviewsData() {
  const [reviews, courses] = await Promise.all([
    db.courseReview.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    db.course.findMany({
      where: { deletedAt: null },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const reviewsForList = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name,
    userEmail: r.user.email,
    userAvatar: r.user.avatar,
    userInitials: getUserInitials(r.user.name),
    courseId: r.course.id,
    courseTitle: r.course.title,
  }));

  return { reviews: reviewsForList, courses };
}

export default async function AdminReviewsPage() {
  await requireAdmin();
  const { reviews, courses } = await getReviewsData();

  const stats = {
    total: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    fiveStars: reviews.filter((r) => r.rating === 5).length,
    oneStars: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Comercial
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Avaliacoes</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>
            {stats.total} {stats.total === 1 ? "avaliacao" : "avaliacoes"}
          </span>
          {stats.total > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Media: {stats.averageRating.toFixed(1)}
              </span>
              <span>·</span>
              <span className="text-emerald-700">
                {stats.fiveStars} com 5 estrelas
              </span>
              {stats.oneStars > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-700">
                    {stats.oneStars} com 1 estrela
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </header>

      <ReviewsList reviews={reviews} courses={courses} />
    </div>
  );
}

export const dynamic = "force-dynamic";