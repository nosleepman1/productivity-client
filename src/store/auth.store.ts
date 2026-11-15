import { create } from "zustand";
import { configureApiAuth } from "@/api/api";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setBootstrapping: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isBootstrapping: false,
    }),

  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && state.user),
    })),

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: Boolean(state.accessToken && user),
    })),

  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
    }),
}));

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  onTokenRefreshed: (accessToken) => {
    useAuthStore.getState().setAccessToken(accessToken);
  },
  onAuthFailure: () => {
    useAuthStore.getState().clearAuth();
  },
});
