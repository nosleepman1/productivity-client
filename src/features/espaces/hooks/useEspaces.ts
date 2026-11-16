import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { espacesService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import { useEspaceStore } from "@/store/espace.store";
import type {
  CreateEspaceDto,
  QueryEspacesDto,
  UpdateEspaceDto,
} from "@/types/espaces";

export const espaceKeys = {
  all: (userId: string) => ["espaces", userId] as const,
  list: (userId: string, query: QueryEspacesDto = {}) =>
    [...espaceKeys.all(userId), "list", query] as const,
  detail: (userId: string, id: string) =>
    [...espaceKeys.all(userId), "detail", id] as const,
};

/**
 * Préfixe canonique pour toutes les ressources cloisonnées par espace
 * (projets, tâches, notes, dépenses, revenus, dettes, créances).
 */
export const espaceScopeKeys = {
  root: ["espace-scope"] as const,
  all: (espaceId: string) => ["espace-scope", espaceId] as const,
};

export function useEspaces(query: QueryEspacesDto = { limit: 50 }) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const reconcileWithEspaces = useEspaceStore((s) => s.reconcileWithEspaces);

  const result = useQuery({
    queryKey: espaceKeys.list(userId ?? "anonymous", query),
    queryFn: () => espacesService.getAll(query),
    enabled: isAuthenticated && Boolean(userId),
  });

  useEffect(() => {
    if (userId && result.data?.data) {
      reconcileWithEspaces(result.data.data, userId);
    }
  }, [reconcileWithEspaces, result.data?.data, userId]);

  return result;
}

export function useActiveEspace() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const activeEspaceId = useEspaceStore((s) => s.activeEspaceId);
  const { data, isLoading, isError } = useEspaces();

  const espaces = useMemo(
    () => (data?.data ?? []).filter((e) => !userId || e.userId === userId),
    [data?.data, userId],
  );

  const activeEspace = useMemo(
    () => espaces.find((e) => e.id === activeEspaceId) ?? espaces[0] ?? null,
    [activeEspaceId, espaces],
  );

  return {
    espaces,
    activeEspace,
    activeEspaceId: activeEspace?.id ?? null,
    isLoading,
    isError,
  };
}

export function useSwitchEspace() {
  const queryClient = useQueryClient();
  const activeEspaceId = useEspaceStore((s) => s.activeEspaceId);
  const setActiveEspaceId = useEspaceStore((s) => s.setActiveEspaceId);
  const { espaces } = useActiveEspace();

  return (targetEspaceId: string) => {
    const target = espaces.find((e) => e.id === targetEspaceId);
    if (!target || target.id === activeEspaceId) {
      return;
    }

    if (activeEspaceId) {
      // Purge le cache de l'espace quitté pour garantir une isolation stricte
      queryClient.removeQueries({
        queryKey: espaceScopeKeys.all(activeEspaceId),
      });
    }

    setActiveEspaceId(target.id);
  };
}

export function useCreateEspaceMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const setActiveEspaceId = useEspaceStore((s) => s.setActiveEspaceId);

  return useMutation({
    mutationFn: (payload: CreateEspaceDto) => espacesService.create(payload),
    onSuccess: (created) => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: espaceKeys.all(userId),
        });
      }
      setActiveEspaceId(created.id);
    },
  });
}

export function useUpdateEspaceMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEspaceDto }) =>
      espacesService.update(id, payload),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: espaceKeys.all(userId),
        });
      }
    },
  });
}

export function useDeleteEspaceMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const activeEspaceId = useEspaceStore((s) => s.activeEspaceId);
  const setActiveEspaceId = useEspaceStore((s) => s.setActiveEspaceId);

  return useMutation({
    mutationFn: (id: string) => espacesService.remove(id),
    onSuccess: (_void, deletedId) => {
      queryClient.removeQueries({
        queryKey: espaceScopeKeys.all(deletedId),
      });
      if (activeEspaceId === deletedId) {
        setActiveEspaceId(null);
      }
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: espaceKeys.all(userId),
        });
      }
    },
  });
}
