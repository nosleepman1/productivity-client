import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import { useAuthStore } from "@/store/auth.store";

export interface InAppNotification {
  id: string;
  titre: string;
  corps: string;
  type: string;
  lien: string;
  lue: boolean;
  espaceId: string | null;
  createdAt: string;
}

export interface InAppNotificationsResponse {
  items: InAppNotification[];
  nonLues: number;
}

export function useInAppNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["notifications", "in-app"],
    queryFn: async () => {
      const { data } =
        await api.get<InAppNotificationsResponse>("/notifications");
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "in-app"],
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/notifications/read-all");
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "in-app"],
      });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/notifications/${id}`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "in-app"],
      });
    },
  });
}
