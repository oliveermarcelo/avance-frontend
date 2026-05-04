"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  GraduationCap,
  CreditCard,
  AlertCircle,
  Award,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType =
  | "WELCOME"
  | "ENROLLMENT_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "COURSE_COMPLETED"
  | "GENERIC";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  variant?: "light" | "dark";
}

const POLL_INTERVAL_MS = 30000;
const DROPDOWN_WIDTH = 340;

const iconByType: Record<NotificationType, typeof Bell> = {
  WELCOME: Sparkles,
  ENROLLMENT_CREATED: GraduationCap,
  PAYMENT_CONFIRMED: CreditCard,
  PAYMENT_FAILED: AlertCircle,
  COURSE_COMPLETED: Award,
  GENERIC: Bell,
};

const colorByType: Record<NotificationType, string> = {
  WELCOME: "text-amber-600 bg-amber-50",
  ENROLLMENT_CREATED: "text-emerald-600 bg-emerald-50",
  PAYMENT_CONFIRMED: "text-blue-600 bg-blue-50",
  PAYMENT_FAILED: "text-red-600 bg-red-50",
  COURSE_COMPLETED: "text-violet-600 bg-violet-50",
  GENERIC: "text-slate-600 bg-slate-50",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `ha ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `ha ${days} dias`;

  return date.toLocaleDateString("pt-BR");
}

export function NotificationBell({ variant = "light" }: NotificationBellProps) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      // silencioso
    }
  }, []);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setHasFetched(true);
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const computePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const top = rect.bottom + 8;
    let left = rect.right - DROPDOWN_WIDTH;
    if (left < 8) left = 8;
    if (left + DROPDOWN_WIDTH > viewportWidth - 8) {
      left = viewportWidth - DROPDOWN_WIDTH - 8;
    }
    setPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    computePosition();
    if (!hasFetched) {
      fetchList();
    }

    const handleResize = () => computePosition();
    const handleScroll = () => computePosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, hasFetched, fetchList, computePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = buttonRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideButton && !insideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setCount((c) => Math.max(0, c - 1));
      } catch {
        // segue mesmo com erro
      }
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setCount(0);
    } catch {
      // silencioso
    }
  };

  const buttonClasses =
    variant === "dark"
      ? "text-sidebar-foreground/90 hover:bg-sidebar-accent/30 active:bg-sidebar-accent/50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  const dropdown =
    isOpen && position ? (
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: DROPDOWN_WIDTH,
          maxWidth: "calc(100vw - 16px)",
          zIndex: 100,
        }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notificacoes</h3>
            {count > 0 && (
              <p className="text-[10px] text-slate-500">
                {count} nao {count === 1 ? "lida" : "lidas"}
              </p>
            )}
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-[#1F3A2D]"
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </button>
          )}
        </header>

        <div className="max-h-[360px] overflow-y-auto">
          {isLoading && !hasFetched ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Nada por aqui ainda
              </p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Voce sera notificado sobre matriculas, pagamentos e novidades dos seus cursos.
              </p>
            </div>
          ) : (
            <ul>
              {notifications.map((notif) => {
                const Icon = iconByType[notif.type];
                const colorClass = colorByType[notif.type];

                return (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50",
                        !notif.isRead && "bg-blue-50/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          colorClass
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              notif.isRead
                                ? "text-slate-700"
                                : "font-bold text-slate-900"
                            )}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-snug">
                          {notif.message}
                        </p>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-slate-100 bg-slate-50">
          <Link
            href="/notificacoes"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-[#1F3A2D] hover:bg-slate-100"
          >
            <Check className="h-3 w-3" />
            Ver todas as notificacoes
          </Link>
        </footer>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Notificacoes"
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition",
          buttonClasses
        )}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {mounted && dropdown && createPortal(dropdown, document.body)}
    </>
  );
}