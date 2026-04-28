"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
  () => import("@/components/avance/video-player").then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video animate-pulse rounded-2xl bg-muted" />
    ),
  }
);
import { LessonSidebar } from "@/components/avance/lesson-sidebar";
import { LessonNotes } from "@/components/avance/lesson-notes";
import {
  updateProgressAction,
  markLessonCompleteAction,
} from "./actions";
import { cn } from "@/lib/utils";

interface LessonContentProps {
  ctx: any;
  slug: string;
}

export function LessonContent({ ctx, slug }: LessonContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cinemaMode, setCinemaMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isWatched, setIsWatched] = useState(ctx.isWatched);
  const playerSecondsRef = useRef(0);

  const { lesson, course, previousLesson, nextLesson, enrollment, notes, watchedLessonIds, initialSeconds } = ctx;

  const handleProgress = (watchedSeconds: number, totalSeconds: number) => {
    playerSecondsRef.current = watchedSeconds;
    if (!enrollment) return;
    startTransition(async () => {
      const res = await updateProgressAction({
        lessonId: lesson.id,
        enrollmentId: enrollment.id,
        watchedSeconds,
        totalSeconds,
        slug,
      });
      if (res.ok && res.completed && !isWatched) {
        setIsWatched(true);
      }
    });
  };

  const handleMarkComplete = () => {
    if (!enrollment) return;
    startTransition(async () => {
      const res = await markLessonCompleteAction({
        lessonId: lesson.id,
        enrollmentId: enrollment.id,
        slug,
      });
      if (res.ok) {
        setIsWatched(true);
        router.refresh();
      }
    });
  };

  const goToNext = () => {
    if (nextLesson) router.push(`/curso/${slug}/aula/${nextLesson.id}`);
    else router.push(`/curso/${slug}`);
  };

  const showSidebar = sidebarOpen && !cinemaMode;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {lesson.moduleTitle}
            </p>
            <h1 className="truncate text-base font-bold text-primary">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCinemaMode((v) => !v)}
              className="hidden md:inline-flex"
            >
              {cinemaMode ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
              {cinemaMode ? "Sair do modo cinema" : "Modo cinema"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden"
            >
              <ListVideo className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className={cn("mx-auto px-6 py-6", cinemaMode ? "max-w-6xl" : "max-w-5xl")}>
          {lesson.videoUrl ? (
            <VideoPlayer
              src={lesson.videoUrl}
              initialSeconds={initialSeconds}
              onProgress={handleProgress}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              Video em breve
            </div>
          )}

          <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => previousLesson && router.push(`/curso/${slug}/aula/${previousLesson.id}`)}
              disabled={!previousLesson}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Aula anterior
            </Button>

            <Button
              variant={isWatched ? "outline" : "default"}
              size="sm"
              onClick={handleMarkComplete}
              disabled={isPending || !enrollment}
            >
              <CheckCircle2 className={cn("mr-2 h-4 w-4", isWatched && "text-accent")} />
              {isWatched ? "Aula concluida" : "Marcar como concluida"}
            </Button>

            <Button size="sm" onClick={goToNext}>
              Proxima aula
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </section>

          {lesson.description && (
            <section className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-primary">Sobre essa aula</h3>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {lesson.description}
              </p>
            </section>
          )}

          {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
            <section className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-primary">Materiais de apoio</h3>
              <ul className="space-y-2">
                {lesson.resources.map((r: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={r.url}
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm transition hover:border-accent"
                    >
                      <span className="text-accent">↓</span>
                      {r.title ?? r.url}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <LessonNotes
              notes={notes}
              lessonId={lesson.id}
              slug={slug}
              getCurrentTimestamp={() =>
                playerSecondsRef.current > 0 ? Math.round(playerSecondsRef.current) : null
              }
            />
          </div>
        </div>
      </main>

      <div className={cn("hidden lg:block", showSidebar ? "" : "lg:hidden")}>
        <LessonSidebar
          courseTitle={course.title}
          courseSlug={course.slug}
          modules={course.modules}
          currentLessonId={lesson.id}
          watchedLessonIds={watchedLessonIds}
          isEnrolled={!!enrollment}
          isOpen={true}
        />
      </div>
    </div>
  );
}