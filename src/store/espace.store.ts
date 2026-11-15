import { create } from "zustand";
import type { Espace } from "@/types/espaces";

const STORAGE_PREFIX = "productivity-active-espace:";

function readScopedEspaceId(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
}

function writeScopedEspaceId(userId: string, espaceId: string | null): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_PREFIX}${userId}`;
  if (espaceId) {
    localStorage.setItem(key, espaceId);
  } else {
    localStorage.removeItem(key);
  }
}

interface EspaceState {
  ownerUserId: string | null;
  activeEspaceId: string | null;
  syncOwner: (userId: string | null) => void;
  setActiveEspaceId: (espaceId: string | null) => void;
  reconcileWithEspaces: (espaces: Espace[], userId: string) => void;
  clearEspace: () => void;
}

export const useEspaceStore = create<EspaceState>((set, get) => ({
  ownerUserId: null,
  activeEspaceId: null,

  syncOwner: (userId) => {
    if (!userId) {
      set({ ownerUserId: null, activeEspaceId: null });
      return;
    }
    const { ownerUserId } = get();
    if (ownerUserId !== userId) {
      set({
        ownerUserId: userId,
        activeEspaceId: readScopedEspaceId(userId),
      });
    }
  },

  setActiveEspaceId: (espaceId) => {
    const { ownerUserId } = get();
    if (!ownerUserId) {
      set({ activeEspaceId: null });
      return;
    }
    writeScopedEspaceId(ownerUserId, espaceId);
    set({ activeEspaceId: espaceId });
  },

  reconcileWithEspaces: (espaces, userId) => {
    const owned = espaces.filter((e) => e.userId === userId);
    const { activeEspaceId } = get();
    const candidate = activeEspaceId ?? readScopedEspaceId(userId);
    const isValid = Boolean(candidate && owned.some((e) => e.id === candidate));
    const resolved = isValid ? candidate : (owned[0]?.id ?? null);

    writeScopedEspaceId(userId, resolved);
    set({
      ownerUserId: userId,
      activeEspaceId: resolved,
    });
  },

  clearEspace: () => {
    set({ ownerUserId: null, activeEspaceId: null });
  },
}));
