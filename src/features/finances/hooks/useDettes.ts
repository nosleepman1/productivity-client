import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { dettesService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateDetteDto,
  CreatePaiementDto,
  QuerySuiviDto,
  UpdateDetteDto,
} from "@/types/finances";

/**
 * Fabrique de clés TanStack Query pour les dettes, strictement isolée par `espaceId`.
 */
export const detteKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "dettes"] as const,
  list: (espaceId: string, query: QuerySuiviDto = {}) =>
    [...detteKeys.all(espaceId), "list", query] as const,
  resume: (espaceId: string) =>
    [...detteKeys.all(espaceId), "resume"] as const,
  detail: (espaceId: string, id: string) =>
    [...detteKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des dettes de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param query - Filtres optionnels de statut, tri, période et pagination.
 */
export function useDettes(
  espaceId: string | null,
  query: QuerySuiviDto = { page: 1, limit: 20, tri: "date", ordre: "desc" },
) {
  return useQuery({
    queryKey: detteKeys.list(espaceId ?? "none", query),
    queryFn: () => dettesService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Charge le résumé chiffré des dettes (`GET /dettes/resume`).
 *
 * @param espaceId - Identifiant de l'espace actif.
 */
export function useDettesResume(espaceId: string | null) {
  return useQuery({
    queryKey: detteKeys.resume(espaceId ?? "none"),
    queryFn: () => dettesService.resume(espaceId!),
    enabled: Boolean(espaceId),
    staleTime: 30_000,
  });
}

/**
 * Charge le détail complet d'une dette et ses paiements associés.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param id - Identifiant de la dette.
 */
export function useDetteDetail(espaceId: string | null, id: string | null) {
  return useQuery({
    queryKey: detteKeys.detail(espaceId ?? "none", id ?? "none"),
    queryFn: () => dettesService.getById(espaceId!, id!),
    enabled: Boolean(espaceId && id),
  });
}

/**
 * Mutation de création d'une dette.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateDetteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDetteDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return dettesService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({ queryKey: detteKeys.all(espaceId) });
      }
      toast.success(
        "Dette enregistrée",
        `${created.description} (${created.montant.toLocaleString("fr-FR")} FCFA)`,
      );
    },
    onError: (err) => {
      toast.error("Échec de l'enregistrement", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de mise à jour d'une dette.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateDetteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDetteDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return dettesService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({ queryKey: detteKeys.all(espaceId) });
      }
      toast.success("Dette mise à jour", updated.description);
    },
    onError: (err) => {
      toast.error("Modification impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'une dette.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteDetteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return dettesService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({ queryKey: detteKeys.all(espaceId) });
      }
      toast.info("Dette supprimée");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation d'ajout d'un remboursement sur une dette.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useAddDettePaiementMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      detteId,
      dto,
    }: {
      detteId: string;
      dto: CreatePaiementDto;
    }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return dettesService.addPaiement(espaceId, detteId, dto);
    },
    onSuccess: (paiement) => {
      if (espaceId) {
        void queryClient.invalidateQueries({ queryKey: detteKeys.all(espaceId) });
      }
      toast.success(
        "Remboursement enregistré",
        `${paiement.montant.toLocaleString("fr-FR")} FCFA déduit du reste dû.`,
      );
    },
    onError: (err) => {
      toast.error("Paiement refusé", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation d'annulation d'un remboursement sur une dette.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useRemoveDettePaiementMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      detteId,
      paiementId,
    }: {
      detteId: string;
      paiementId: string;
    }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return dettesService.removePaiement(espaceId, detteId, paiementId);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({ queryKey: detteKeys.all(espaceId) });
      }
      toast.info("Paiement annulé");
    },
    onError: (err) => {
      toast.error("Annulation impossible", getApiErrorMessage(err));
    },
  });
}
