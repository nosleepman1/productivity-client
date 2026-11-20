import { useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkUpdate = () => {
        if (navigator.onLine) {
          void registration.update();
        }
      };

      window.setInterval(checkUpdate, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkUpdate();
        }
      });
    },
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      className="fixed inset-x-0 z-[70] mx-auto w-[calc(100%-1.5rem)] max-w-md px-1"
    >
      <div className="apple-glass flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              Nouvelle version disponible
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Actualisez pour profiter des dernières améliorations.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="apple-press rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Plus tard"
            title="Plus tard"
            className="apple-press rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
