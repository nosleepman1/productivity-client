import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface Habitude {
  id: string;
  titre: string;
  description: string | null;
  icone: string;
  couleur: string;
  frequence: "QUOTIDIEN" | "JOURS_OUVRES" | "HEBDOMADAIRE";
  momentJournee: "MATIN" | "APRES_MIDI" | "SOIR" | "TOUTE_JOURNEE";
  serieActuelle: number;
  meilleureSerie: number;
  completeeAujourdhui: boolean;
  suivis: { id: string; date: string; completee: boolean }[];
  espaceId: string;
  createdAt: string;
}

export interface CreateHabitudeDto {
  titre: string;
  description?: string;
  icone?: string;
  couleur?: string;
  frequence?: "QUOTIDIEN" | "JOURS_OUVRES" | "HEBDOMADAIRE";
  momentJournee?: "MATIN" | "APRES_MIDI" | "SOIR" | "TOUTE_JOURNEE";
}

export function useHabitudes(espaceId: string | null) {
  return useQuery({
    queryKey: ["habitudes", espaceId],
    queryFn: async () => {
      const { data } = await api.get<Habitude[]>(
        `/espaces/${espaceId}/habitudes`,
      );
      return data;
    },
    enabled: Boolean(espaceId),
  });
}

export function useCreateHabitudeMutation(espaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateHabitudeDto) => {
      const { data } = await api.post<Habitude>(
        `/espaces/${espaceId}/habitudes`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habitudes", espaceId] });
    },
  });
}

export function useToggleHabitudeMutation(espaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date?: string }) => {
      const { data } = await api.post<Habitude>(
        `/espaces/${espaceId}/habitudes/${id}/toggle`,
        date ? { date } : {},
      );
      return data;
    },
    onMutate: async ({ id }) => {
      const key = ["habitudes", espaceId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Habitude[]>(key);
      if (previous) {
        queryClient.setQueryData<Habitude[]>(
          key,
          previous.map((h) => {
            if (h.id !== id) return h;
            const nextDone = !h.completeeAujourdhui;
            const nextStreak = nextDone
              ? h.serieActuelle + 1
              : Math.max(0, h.serieActuelle - 1);
            return {
              ...h,
              completeeAujourdhui: nextDone,
              serieActuelle: nextStreak,
              meilleureSerie: Math.max(h.meilleureSerie, nextStreak),
            };
          }),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["habitudes", espaceId], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["habitudes", espaceId] });
    },
  });
}

export function useDeleteHabitudeMutation(espaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/espaces/${espaceId}/habitudes/${id}`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habitudes", espaceId] });
    },
  });
}
