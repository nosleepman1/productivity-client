import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { revenusService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateRevenuDto,
  QueryTransactionsDto,
  UpdateRevenuDto,
} from "@/types/finances";

/**
 * Fabrique de clés TanStack Query pour les revenus, strictement isolée par `espaceId`.
 */
export const revenuKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "revenus"] as const,
  list: (espaceId: string, query: QueryTransactionsDto = {}) =>
    [...revenuKeys.all(espaceId), "list", query] as const,
  detail: (espaceId: string, id: string) =>
    [...revenuKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des revenus de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif (ou `null` si indisponible).
 * @param query - Filtres optionnels de tri, période et pagination.
 */
export function useRevenus(
  espaceId: string | null,
  query: QueryTransactionsDto = { page: 1, limit: 20, tri: "date", ordre: "desc" },
) {
  return useQuery({
    queryKey: revenuKeys.list(espaceId ?? "none", query),
    queryFn: () => revenusService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Mutation de création d'un revenu dans l'espace spécifié.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateRevenuMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRevenuDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return revenusService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: revenuKeys.all(espaceId),
        });
      }
      toast.success(
        "Revenu enregistré",
        `${created.description} (+${created.montant.toLocaleString("fr-FR")} FCFA)`,
      );
    },
    onError: (err) => {
      toast.error("Échec de l'enregistrement", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de modification d'un revenu existant.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateRevenuMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRevenuDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return revenusService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: revenuKeys.all(espaceId),
        });
      }
      toast.success("Revenu modifié", updated.description);
    },
    onError: (err) => {
      toast.error("Modification impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'un revenu.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteRevenuMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return revenusService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: revenuKeys.all(espaceId),
        });
      }
      toast.info("Revenu supprimé");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
