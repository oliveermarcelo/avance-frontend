"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  GraduationCap,
  CreditCard,
  AlertCircle,
  Award,
  CheckCheck,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { markAllAsReadAction, markOneAsReadAction } from "@/app/(app)/notificacoes/actions";
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
  readAt: string | null;
  createdAt: string;
}

interface NotificationsListProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

const iconByType: Record<NotificationType, typeof Bell> = {
  WELCOME: Sparkles,
  ENROLLMENT_CREATED: GraduationCap,
  PAYMENT_CONFIRMED: CreditCard,
  PAYMENT_FAILED: AlertCircle,
  COURSE_COMPLETED: Award,
  GENERIC: Bell,
};

const colorByType: Record<NotificationType, string> = {
  WELCOME: "text-amber-600 bg-amber-50 border-amber-100",
  ENROLLMENT_CREATED: "text-emerald-600 bg-emerald-50 border-emerald-100",
  PAYMENT_CONFIRMED: "text-blue-600 bg-blue-50 border-blue-100",
  PAYMENT_FAILED: "text-red-600 bg-red-50 border-red-100",
  COURSE_COMPLETED: "text-violet-600 bg-violet-50 border-violet-100",
  GENERIC: "text-slate-600 bg-slate-50 border-slate-100",
};

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsList({
  initialNotifications,
  initialUnreadCount,
}: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) {
      startTransition(async () => {
        await markOneAsReadAction(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      });
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 self-start">
          <button
            type="button"
            onClick={() => setFilter("all")}
            disabled={isPending}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            disabled={isPending}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              filter === "unread"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Nao lidas ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-border bg-card px-4 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-50 sm:self-auto"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Marcar todas como lidas
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-bold text-primary">
            {filter === "unread" ? "Nenhuma notificacao nao lida" : "Nenhuma notificacao ainda"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {filter === "unread"
              ? "Voce esta em dia! Volte aqui quando houver novidades."
              : "Voce sera notificado sobre matriculas, pagamentos e novidades dos seus cursos."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((notif) => {
            const Icon = iconByType[notif.type];
            const colorClass = colorByType[notif.type];

            return (
              <li key={notif.id}>
                <button
                  type="button"
                  onClick={() => handleClick(notif)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left transition disabled:opacity-50",
                    notif.isRead
                      ? "border-border hover:border-accent/40"
                      : "border-blue-200 bg-blue-50/30 hover:border-blue-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          notif.isRead
                            ? "text-foreground"
                            : "font-bold text-primary"
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-muted-foreground/70">
                        {formatFullDate(notif.createdAt)}
                        {notif.isRead && notif.readAt && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-600">
                            <Check className="h-2.5 w-2.5" />
                            Lida
                          </span>
                        )}
                      </p>
                      {notif.link && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                          Abrir
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}