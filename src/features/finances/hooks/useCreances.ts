import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { creancesService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateCreanceDto,
  CreatePaiementDto,
  QuerySuiviDto,
  UpdateCreanceDto,
} from "@/types/finances";

/**
 * Fabrique de clés TanStack Query pour les créances, strictement isolée par `espaceId`.
 */
export const creanceKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "creances"] as const,
  list: (espaceId: string, query: QuerySuiviDto = {}) =>
    [...creanceKeys.all(espaceId), "list", query] as const,
  resume: (espaceId: string) =>
    [...creanceKeys.all(espaceId), "resume"] as const,
  detail: (espaceId: string, id: string) =>
    [...creanceKeys.all(espaceId), "detail", id] as const,
  relance: (espaceId: string, id: string) =>
    [...creanceKeys.all(espaceId), "relance", id] as const,
};

/**
 * Charge la liste paginée des créances de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param query - Filtres optionnels de statut, tri, période et pagination.
 */
export function useCreances(
  espaceId: string | null,
  query: QuerySuiviDto = { page: 1, limit: 20, tri: "date", ordre: "desc" },
) {
  return useQuery({
    queryKey: creanceKeys.list(espaceId ?? "none", query),
    queryFn: () => creancesService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Charge le résumé chiffré des créances (`GET /creances/resume`).
 *
 * @param espaceId - Identifiant de l'espace actif.
 */
export function useCreancesResume(espaceId: string | null) {
  return useQuery({
    queryKey: creanceKeys.resume(espaceId ?? "none"),
    queryFn: () => creancesService.resume(espaceId!),
    enabled: Boolean(espaceId),
    staleTime: 30_000,
  });
}

/**
 * Charge le détail complet d'une créance et son historique d'encaissements.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param id - Identifiant de la créance.
 */
export function useCreanceDetail(espaceId: string | null, id: string | null) {
  return useQuery({
    queryKey: creanceKeys.detail(espaceId ?? "none", id ?? "none"),
    queryFn: () => creancesService.getById(espaceId!, id!),
    enabled: Boolean(espaceId && id),
  });
}

/**
 * Charge le message et lien WhatsApp de relance pour une créance donnée.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param id - Identifiant de la créance à relancer.
 */
export function useCreanceRelance(espaceId: string | null, id: string | null) {
  return useQuery({
    queryKey: creanceKeys.relance(espaceId ?? "none", id ?? "none"),
    queryFn: () => creancesService.getRelance(espaceId!, id!),
    enabled: Boolean(espaceId && id),
  });
}

/**
 * Mutation de création d'une créance.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateCreanceMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCreanceDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return creancesService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: creanceKeys.all(espaceId),
        });
      }
      toast.success(
        "Créance enregistrée",
        `${created.description} (${created.montant.toLocaleString("fr-FR")} FCFA)`,
      );
    },
    onError: (err) => {
      toast.error("Échec de l'enregistrement", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de mise à jour d'une créance.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateCreanceMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCreanceDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return creancesService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: creanceKeys.all(espaceId),
        });
      }
      toast.success("Créance mise à jour", updated.description);
    },
    onError: (err) => {
      toast.error("Modification impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'une créance.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteCreanceMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return creancesService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: creanceKeys.all(espaceId),
        });
      }
      toast.info("Créance supprimée");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation d'ajout d'un encaissement sur une créance.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useAddCreancePaiementMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      creanceId,
      dto,
    }: {
      creanceId: string;
      dto: CreatePaiementDto;
    }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return creancesService.addPaiement(espaceId, creanceId, dto);
    },
    onSuccess: (paiement) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: creanceKeys.all(espaceId),
        });
      }
      toast.success(
        "Encaissement enregistré",
        `${paiement.montant.toLocaleString("fr-FR")} FCFA reçu.`,
      );
    },
    onError: (err) => {
      toast.error("Paiement refusé", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation d'annulation d'un encaissement sur une créance.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useRemoveCreancePaiementMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      creanceId,
      paiementId,
    }: {
      creanceId: string;
      paiementId: string;
    }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return creancesService.removePaiement(espaceId, creanceId, paiementId);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: creanceKeys.all(espaceId),
        });
      }
      toast.info("Encaissement annulé");
    },
    onError: (err) => {
      toast.error("Annulation impossible", getApiErrorMessage(err));
    },
  });
}
