import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { espaceScopeKeys } from "@/features/espaces/hooks/useEspaces";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { notesService } from "@/services";
import { toast } from "@/store/toast.store";
import type {
  CreateNoteDto,
  QueryNotesDto,
  UpdateNoteDto,
} from "@/types/productivity";

/**
 * Fabrique de clés TanStack Query pour les notes, strictement isolée par `espaceId`.
 */
export const noteKeys = {
  all: (espaceId: string) =>
    [...espaceScopeKeys.all(espaceId), "notes"] as const,
  list: (espaceId: string, query: QueryNotesDto = {}) =>
    [...noteKeys.all(espaceId), "list", query] as const,
  detail: (espaceId: string, id: string) =>
    [...noteKeys.all(espaceId), "detail", id] as const,
};

/**
 * Charge la liste paginée des notes et idées de l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace actif.
 * @param query - Paramètres optionnels de tri et pagination.
 */
export function useNotes(
  espaceId: string | null,
  query: QueryNotesDto = { page: 1, limit: 30, tri: "updatedAt", ordre: "desc" },
) {
  return useQuery({
    queryKey: noteKeys.list(espaceId ?? "none", query),
    queryFn: () => notesService.list(espaceId!, query),
    enabled: Boolean(espaceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Mutation de création d'une note dans l'espace actif.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useCreateNoteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateNoteDto) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return notesService.create(espaceId, dto);
    },
    onSuccess: (created) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: noteKeys.all(espaceId),
        });
      }
      toast.success("Note enregistrée", created.titre);
    },
    onError: (err) => {
      toast.error("Création de la note impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de modification d'une note existante.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useUpdateNoteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateNoteDto }) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return notesService.update(espaceId, id, dto);
    },
    onSuccess: (updated) => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: noteKeys.all(espaceId),
        });
      }
      toast.success("Note mise à jour", updated.titre);
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'une note.
 *
 * @param espaceId - Identifiant de l'espace cible.
 */
export function useDeleteNoteMutation(espaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!espaceId) throw new Error("Aucun espace actif sélectionné.");
      return notesService.remove(espaceId, id);
    },
    onSuccess: () => {
      if (espaceId) {
        void queryClient.invalidateQueries({
          queryKey: noteKeys.all(espaceId),
        });
      }
      toast.info("Note supprimée");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
