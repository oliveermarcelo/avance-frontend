import { notFound, redirect } from "next/navigation";
import { LessonContent } from "./lesson-content";
import { getCurrentUser } from "@/lib/data/user";
import { getLessonContext } from "@/lib/data/lesson";

export default async function AulaPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ctx = await getLessonContext(slug, lessonId, user.id);
  if (!ctx) notFound();

  if (!ctx.enrollment && !ctx.lesson.isFree) {
    redirect(`/aprender/${slug}`);
  }

  return <LessonContent ctx={ctx} slug={slug} />;
}

export const dynamic = "force-dynamic";