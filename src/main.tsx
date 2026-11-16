import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n";
import "./index.css";
import App from "./App.tsx";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || "Erreur inattendue" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppErrorBoundary:", error, info);
  }

  handleHardReset = async () => {
    try {
      localStorage.removeItem("productivity-rq-cache");
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // Ignore cleanup error
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-6 text-center text-foreground">
          <div className="max-w-sm space-y-3 rounded-3xl border border-border bg-card p-6 shadow-lg">
            <h1 className="text-base font-bold">
              Une mise à jour nécessite un rechargement
            </h1>
            <p className="text-xs text-muted-foreground">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => void this.handleHardReset()}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
            >
              Actualiser l&apos;application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const RQ_CACHE_KEY = "productivity-rq-cache";
const PERSISTABLE_PREFIXES = new Set([
  "espaces",
  "finances-resume",
  "habitudes",
  "taches",
  "profil",
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Hydratation instantanée du cache local pour afficher les données à 0 ms au démarrage
try {
  const raw = localStorage.getItem(RQ_CACHE_KEY);
  if (raw) {
    const entries = JSON.parse(raw) as Array<{
      queryKey: unknown[];
      data: unknown;
      updatedAt: number;
    }>;
    const maxAgeMs = 1000 * 60 * 60 * 12;
    const now = Date.now();
    for (const entry of entries) {
      if (now - entry.updatedAt < maxAgeMs && Array.isArray(entry.queryKey)) {
        queryClient.setQueryData(entry.queryKey, entry.data, {
          updatedAt: entry.updatedAt,
        });
      }
    }
  }
} catch {
  // Ignore malformed local cache
}

// Sauvegarde légère en arrière-plan lors des mises à jour de cache
let saveTimer: number | null = null;
queryClient.getQueryCache().subscribe((event) => {
  if (event.type !== "updated" || event.action.type !== "success") return;
  const firstKey = event.query.queryKey[0];
  if (typeof firstKey !== "string" || !PERSISTABLE_PREFIXES.has(firstKey)) {
    return;
  }
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    try {
      const snapshot = queryClient
        .getQueryCache()
        .getAll()
        .filter(
          (q) =>
            q.state.status === "success" &&
            typeof q.queryKey[0] === "string" &&
            PERSISTABLE_PREFIXES.has(q.queryKey[0]),
        )
        .slice(0, 25)
        .map((q) => ({
          queryKey: q.queryKey,
          data: q.state.data,
          updatedAt: q.state.dataUpdatedAt,
        }));
      localStorage.setItem(RQ_CACHE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore quota errors
    }
  }, 400);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
