import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { tachesService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateTacheDto,
  QueryTachesDto,
  UpdateTacheDto,
} from "@/types/productivity";

/**
 * Fabrique de clés TanStack Query pour les tâches, strictement isolée par `espaceId`.
 */
export const tacheKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "taches"] as const,
  list: (espaceId: string, query: QueryTachesDto = {}) =>
    [...tacheKeys.all(espaceId), "list", query] as const,
  detail: (espaceId: string, id: string) =>
    [...tacheKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des tâches de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param query - Paramètres optionnels de tri et pagination.
 */
export function useTaches(
  espaceId: string | null,
  query: QueryTachesDto = { page: 1, limit: 50, tri: "dateLimite", ordre: "asc" },
) {
  return useQuery({
    queryKey: tacheKeys.list(espaceId ?? "none", query),
    queryFn: () => tachesService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Mutation de création d'une tâche dans l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateTacheMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTacheDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return tachesService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: tacheKeys.all(espaceId),
        });
      }
      toast.success("Tâche ajoutée", created.titre);
    },
    onError: (err) => {
      toast.error("Création de la tâche impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de mise à jour d'une tâche (édition ou bascule `estTerminee`).
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateTacheMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTacheDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return tachesService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: tacheKeys.all(espaceId),
        });
      }
      toast.success(
        updated.estTerminee ? "Tâche terminée" : "Tâche mise à jour",
        updated.titre,
      );
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'une tâche.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteTacheMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return tachesService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: tacheKeys.all(espaceId),
        });
      }
      toast.info("Tâche supprimée");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
