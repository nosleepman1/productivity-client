import React from "react";
import { Laptop, Loader2, LogOut, Smartphone, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useLogoutAllMutation,
  useRevokeSessionMutation,
  useSessions,
} from "@/features/auth/hooks/useAuth";

interface SessionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const SessionsModal: React.FC<SessionsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: sessions = [], isLoading } = useSessions();
  const revokeMutation = useRevokeSessionMutation();
  const logoutAllMutation = useLogoutAllMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Appareils &amp; Sessions actives
          </DialogTitle>
          <DialogDescription className="text-xs">
            Révoquez immédiatement l&apos;accès d&apos;un appareil que vous ne reconnaissez pas.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Aucune session active trouvée.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {sessions.map((session) => {
                const label = session.appareil || "Navigateur / Appareil";
                const isMobile = /mobile|iphone|android|ipad/i.test(label);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/35 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border/70 text-foreground">
                        {isMobile ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Laptop className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {label}
                          </p>
                          {session.actuelle && (
                            <span className="shrink-0 rounded-full bg-[var(--finance)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--finance)]">
                              Cet appareil
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                          {session.ip ?? "IP masquée"} ·{" "}
                          {formatDateShort(session.creeLe)}
                        </p>
                      </div>
                    </div>

                    {!session.actuelle && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Révoquer cette session"
                        disabled={revokeMutation.isPending}
                        onClick={() => revokeMutation.mutate(session.id)}
                        className="apple-press h-9 w-9 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {sessions.length > 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={logoutAllMutation.isPending}
                onClick={() => logoutAllMutation.mutate()}
                className="apple-press h-10 w-full rounded-xl border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10 gap-2"
              >
                {logoutAllMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnecter tous les appareils
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
