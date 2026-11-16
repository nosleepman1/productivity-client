import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { projetsService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateProjetDto,
  QueryProjetsDto,
  UpdateProjetDto,
} from "@/types/productivity";

/**
 * Fabrique de clés TanStack Query pour les projets, strictement isolée par `espaceId`.
 */
export const projetKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "projets"] as const,
  list: (espaceId: string, query: QueryProjetsDto = {}) =>
    [...projetKeys.all(espaceId), "list", query] as const,
  detail: (espaceId: string, id: string) =>
    [...projetKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des projets de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param query - Paramètres optionnels de tri et pagination.
 */
export function useProjets(
  espaceId: string | null,
  query: QueryProjetsDto = { page: 1, limit: 20, tri: "createdAt", ordre: "desc" },
) {
  return useQuery({
    queryKey: projetKeys.list(espaceId ?? "none", query),
    queryFn: () => projetsService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Mutation de création d'un projet dans l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateProjetMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProjetDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return projetsService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: projetKeys.all(espaceId),
        });
      }
      toast.success("Projet créé", created.titre);
    },
    onError: (err) => {
      toast.error("Création du projet impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de mise à jour d'un projet (édition ou bascule terminé/actif).
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateProjetMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjetDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return projetsService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: projetKeys.all(espaceId),
        });
      }
      toast.success(
        updated.estTermine ? "Projet terminé" : "Projet mis à jour",
        updated.titre,
      );
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'un projet.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteProjetMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return projetsService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: projetKeys.all(espaceId),
        });
      }
      toast.info("Projet supprimé");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
