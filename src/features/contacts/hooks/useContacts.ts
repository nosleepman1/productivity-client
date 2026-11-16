import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/features/finances/utils/format";
import { contactsService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import type {
  CreateContactDto,
  QueryContactsDto,
  UpdateContactDto,
} from "@/types/contacts";

/**
 * Fabrique de clés TanStack Query pour les contacts, cloisonnée par `userId`.
 */
export const contactKeys = {
  all: (userId: string) => ["contacts", userId] as const,
  list: (userId: string, query: QueryContactsDto = {}) =>
    [...contactKeys.all(userId), "list", query] as const,
  detail: (userId: string, id: string) =>
    [...contactKeys.all(userId), "detail", id] as const,
};

/**
 * Récupère la liste paginée des contacts de l'utilisateur authentifié.
 *
 * @param query - Filtres optionnels de recherche, type et pagination.
 * @returns Requête TanStack Query contenant la page de contacts.
 */
export function useContacts(query: QueryContactsDto = { limit: 100 }) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: contactKeys.list(userId ?? "anonymous", query),
    queryFn: () => contactsService.list(query),
    enabled: isAuthenticated && Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/**
 * Mutation de création d'un contact avec notification et invalidation du cache.
 */
export function useCreateContactMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    mutationFn: (dto: CreateContactDto) => contactsService.create(dto),
    onSuccess: (created) => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all(userId) });
      }
      toast.success("Contact ajouté", `${created.nom} est prêt à être associé.`);
    },
    onError: (err) => {
      toast.error("Impossible de créer le contact", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de mise à jour d'un contact existant.
 */
export function useUpdateContactMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContactDto }) =>
      contactsService.update(id, dto),
    onSuccess: (updated) => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all(userId) });
      }
      toast.success("Contact mis à jour", updated.nom);
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", getApiErrorMessage(err));
    },
  });
}

/**
 * Mutation de suppression d'un contact.
 */
export function useDeleteContactMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    mutationFn: (id: string) => contactsService.remove(id),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all(userId) });
      }
      toast.info("Contact supprimé");
    },
    onError: (err) => {
      toast.error("Suppression impossible", getApiErrorMessage(err));
    },
  });
}
