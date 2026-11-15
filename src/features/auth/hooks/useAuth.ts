import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import type { GoogleLoginDto, LoginDto, RegisterDto } from "@/types/auth";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
  });
}

export function useSessions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authService.getSessions(),
    enabled: isAuthenticated,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginDto) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: GoogleLoginDto) => authService.loginWithGoogle(payload),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterDto) => authService.register(payload),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useLogoutAllMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
  });
}

export function useBootstrapAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const tokens = await authService.refresh();
        if (!active) return;
        setAccessToken(tokens.accessToken);

        const user = await authService.getMe();
        if (!active) return;
        setAuth(tokens.accessToken, user);
      } catch {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [clearAuth, setAccessToken, setAuth, setBootstrapping]);
}
