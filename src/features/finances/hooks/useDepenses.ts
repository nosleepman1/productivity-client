import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { depensesService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateDepenseDto,
  QueryTransactionsDto,
  UpdateDepenseDto,
} from "@/types/finances";

/**
 * Fabrique de clés TanStack Query pour les dépenses, strictement isolée par `espaceId`.
 */
export const depenseKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "depenses"] as const,
  list: (espaceId: string, query: QueryTransactionsDto = {}) =>
    [...depenseKeys.all(espaceId), "list", query] as const,
  detail: (espaceId: string, id: string) =>
    [...depenseKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des dépenses de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif (ou `null`).
 * @param query - Filtres optionnels de tri, période et pagination.
 */
export function useDepenses(
  espaceId: string | null,
  query: QueryTransactionsDto = { page: 1, limit: 20, tri: "date", ordre: "desc" },
) {
  return useQuery({
    queryKey: depenseKeys.list(espaceId ?? "none", query),
    queryFn: () => depensesService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Mutation de création d'une dépense dans l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateDepenseMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDepenseDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return depensesService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: depenseKeys.all(espaceId),
        });
      }
      toast.success(
        "Dépense enregistrée",
        `${created.description} (-${created.montant.toLocaleString("fr-FR")} FCFA)`,
      );
    },
    onError: (err) => {
      toast.error("Échec de l'enregistrement", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de modification d'une dépense existante.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateDepenseMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepenseDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return depensesService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: depenseKeys.all(espaceId),
        });
      }
      toast.success("Dépense modifiée", updated.description);
    },
    onError: (err) => {
      toast.error("Modification impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'une dépense.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteDepenseMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return depensesService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: depenseKeys.all(espaceId),
        });
      }
      toast.info("Dépense supprimée");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
