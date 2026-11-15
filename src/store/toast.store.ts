import { create } from "zustand";

/** Niveau sémantique d'une notification toast. */
export type ToastVariant = "success" | "error" | "info";

/** Représentation d'un message toast affiché à l'utilisateur. */
export interface ToastItem {
  /** Identifiant unique généré automatiquement. */
  id: string;
  /** Type visuel du toast. */
  variant: ToastVariant;
  /** Titre principal court. */
  title: string;
  /** Précision optionnelle affichée sous le titre. */
  description?: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

/**
 * Store Zustand léger gérant la file des notifications toast Apple-style.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (toast, durationMs = 3600) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { ...toast, id }],
    }));

    if (durationMs > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, durationMs);
    }
  },

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/**
 * Raccourcis impératifs pour déclencher un toast depuis les hooks ou services.
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "error", title, description }, 4800),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "info", title, description }),
};
