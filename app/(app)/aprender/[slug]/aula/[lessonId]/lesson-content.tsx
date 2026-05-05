"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  Maximize2,
  Minimize2,
  X,
  Menu,
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
import { LessonTabs } from "./lesson-tabs";
import {
  updateProgressAction,
  markLessonCompleteAction,
} from "./actions";
import { useSidebar } from "@/components/avance/sidebar-context";
import { cn } from "@/lib/utils";

interface LessonContentProps {
  ctx: any;
  slug: string;
}

export function LessonContent({ ctx, slug }: LessonContentProps) {
  const router = useRouter();
  const { open: openMainSidebar } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [cinemaMode, setCinemaMode] = useState(false);
  const [lessonsDrawerOpen, setLessonsDrawerOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(ctx.isWatched);
  const playerSecondsRef = useRef(0);

  const {
    lesson,
    course,
    previousLesson,
    nextLesson,
    enrollment,
    notes,
    watchedLessonIds,
    initialSeconds,
    questions,
  } = ctx;

  useEffect(() => {
    if (lessonsDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lessonsDrawerOpen]);

  useEffect(() => {
    if (!lessonsDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLessonsDrawerOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lessonsDrawerOpen]);

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
    if (nextLesson) router.push(`/aprender/${slug}/aula/${nextLesson.id}`);
    else router.push(`/aprender/${slug}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-3 backdrop-blur sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={openMainSidebar}
            aria-label="Menu principal"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-primary lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent truncate">
              {lesson.moduleTitle}
            </p>
            <h1 className="truncate text-sm font-bold text-primary sm:text-base">
              {lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCinemaMode((v) => !v)}
              className="hidden md:inline-flex"
            >
              {cinemaMode ? (
                <Minimize2 className="mr-2 h-4 w-4" />
              ) : (
                <Maximize2 className="mr-2 h-4 w-4" />
              )}
              {cinemaMode ? "Sair do modo cinema" : "Modo cinema"}
            </Button>

            <button
              type="button"
              onClick={() => setLessonsDrawerOpen(true)}
              aria-label="Ver aulas do curso"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold text-primary transition hover:border-accent xl:hidden"
            >
              <ListVideo className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Aulas</span>
            </button>
          </div>
        </header>

        <div
          className={cn(
            "mx-auto px-3 py-4 sm:px-6 sm:py-6",
            cinemaMode ? "max-w-6xl" : "max-w-5xl"
          )}
        >
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

          <section className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-2 sm:mt-6 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                previousLesson &&
                router.push(`/aprender/${slug}/aula/${previousLesson.id}`)
              }
              disabled={!previousLesson}
              className="justify-center"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Aula anterior</span>
              <span className="sm:hidden text-[10px]">Anterior</span>
            </Button>

            <Button
              variant={isWatched ? "outline" : "default"}
              size="sm"
              onClick={handleMarkComplete}
              disabled={isPending || !enrollment}
              className="justify-center"
            >
              <CheckCircle2
                className={cn("h-4 w-4 sm:mr-2", isWatched && "text-accent")}
              />
              <span className="hidden sm:inline">
                {isWatched ? "Aula concluida" : "Marcar como concluida"}
              </span>
              <span className="sm:hidden text-[10px]">
                {isWatched ? "Concluida" : "Concluir"}
              </span>
            </Button>

            <Button size="sm" onClick={goToNext} className="justify-center">
              <span className="hidden sm:inline">Proxima aula</span>
              <span className="sm:hidden text-[10px]">Proxima</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </section>

          {lesson.description && (
            <section className="mt-5 space-y-3 sm:mt-6">
              <h3 className="text-sm font-bold text-primary">Sobre essa aula</h3>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {lesson.description}
              </p>
            </section>
          )}

          {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
            <section className="mt-5 space-y-3 sm:mt-6">
              <h3 className="text-sm font-bold text-primary">Materiais de apoio</h3>
              <ul className="space-y-2">
                {lesson.resources.map((r: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={r.url}
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm transition hover:border-accent"
                    >
                      <span className="text-accent">@</span>
                      {r.title ?? r.url}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-6 sm:mt-8">
            <LessonTabs
              notes={notes}
              lessonId={lesson.id}
              slug={slug}
              courseId={course.id}
              questions={questions ?? []}
              getCurrentTimestamp={() =>
                playerSecondsRef.current > 0
                  ? Math.round(playerSecondsRef.current)
                  : null
              }
            />
          </div>
        </div>
      </main>

      <div
        onClick={() => setLessonsDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity xl:hidden",
          lessonsDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm transition-transform duration-300",
          "xl:relative xl:max-w-none xl:w-auto xl:transform-none xl:transition-none xl:z-auto",
          lessonsDrawerOpen
            ? "translate-x-0"
            : "translate-x-full xl:translate-x-0",
          cinemaMode && "xl:hidden"
        )}
      >
        <button
          type="button"
          onClick={() => setLessonsDrawerOpen(false)}
          aria-label="Fechar"
          className="absolute left-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background/80 backdrop-blur text-muted-foreground transition hover:bg-muted hover:text-primary xl:hidden"
        >
          <X className="h-4 w-4" />
        </button>

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