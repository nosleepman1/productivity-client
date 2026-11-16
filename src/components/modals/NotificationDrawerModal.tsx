import { Bell, CheckCheck, ExternalLink, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useDeleteNotificationMutation,
  useInAppNotifications,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type InAppNotification,
} from "@/features/notifications/hooks/useInAppNotifications";

export interface NotificationDrawerModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateLink: (lien: string) => void;
}

export function NotificationDrawerModal({
  open,
  onClose,
  onNavigateLink,
}: NotificationDrawerModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useInAppNotifications();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const deleteNotif = useDeleteNotificationMutation();

  if (!open) return null;

  const items = data?.items ?? [];
  const nonLues = data?.nonLues ?? 0;

  const handleSelect = (n: InAppNotification) => {
    if (!n.lue) {
      markRead.mutate(n.id);
    }
    if (n.lien) {
      onNavigateLink(n.lien);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {t("notifications.title")}
            </h2>
            {nonLues > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                {nonLues}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {nonLues > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                {t("notifications.markAllRead")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <p className="py-10 text-center text-xs text-muted-foreground">
              {t("notifications.loading")}
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {t("notifications.emptyTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("notifications.emptyDesc")}
              </p>
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`group relative rounded-2xl border p-3.5 transition-all ${
                  n.lue
                    ? "border-border/60 bg-background/50 opacity-80"
                    : "border-primary/30 bg-primary/5 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(n)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      {!n.lue && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <p className="text-xs font-semibold text-foreground">
                        {n.titre}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {n.corps}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>
                        {new Date(n.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-primary font-medium">
                        Ouvrir <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotif.mutate(n.id)}
                    aria-label="Supprimer la notification"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
