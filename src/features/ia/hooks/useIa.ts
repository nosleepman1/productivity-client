import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  iaApi,
  type IaExecutableAction,
  type IaProviderId,
} from "../api/ia.api";

export const iaKeys = {
  all: ["ia"] as const,
  config: () => [...iaKeys.all, "config"] as const,
  status: (espaceId: string) => [...iaKeys.all, "status", espaceId] as const,
  conversations: (espaceId: string) =>
    [...iaKeys.all, "conversations", espaceId] as const,
  conversation: (espaceId: string, id: string) =>
    [...iaKeys.all, "conversation", espaceId, id] as const,
};

export function useAiName(): string {
  const { data } = useQuery({
    queryKey: iaKeys.config(),
    queryFn: iaApi.getConfig,
    staleTime: 10_000,
    refetchOnMount: "always",
  });
  return data?.aiName?.trim() || "Ndimbeul Bot";
}

export function useIaStatus(espaceId: string | null) {
  return useQuery({
    queryKey: espaceId ? iaKeys.status(espaceId) : ["ia", "status", "none"],
    queryFn: () => iaApi.getStatus(espaceId!),
    enabled: Boolean(espaceId),
    staleTime: 60_000,
  });
}

export function useIaConversations(espaceId: string | null, enabled = true) {
  return useQuery({
    queryKey: espaceId
      ? iaKeys.conversations(espaceId)
      : ["ia", "conversations", "none"],
    queryFn: () => iaApi.listConversations(espaceId!),
    enabled: Boolean(espaceId) && enabled,
  });
}

export function useIaChatMutation(espaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      message: string;
      conversationId?: string;
      provider?: IaProviderId;
    }) => iaApi.chat(espaceId!, payload),
    onSuccess: () => {
      if (espaceId) {
        void qc.invalidateQueries({
          queryKey: iaKeys.conversations(espaceId),
        });
      }
    },
    onSettled: () => {
      if (espaceId) {
        void qc.invalidateQueries({
          queryKey: iaKeys.status(espaceId),
        });
      }
      void qc.invalidateQueries({ queryKey: ["subscriptions", "me"] });
    },
  });
}

export function useIaExecuteActionMutation(espaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: IaExecutableAction) =>
      iaApi.executeAction(espaceId!, action),
    onSuccess: () => {
      // Rafraîchit toutes les vues concernées (finances, tâches, notes, habitudes)
      void qc.invalidateQueries({ queryKey: ["finances"] });
      void qc.invalidateQueries({ queryKey: ["depenses"] });
      void qc.invalidateQueries({ queryKey: ["revenus"] });
      void qc.invalidateQueries({ queryKey: ["taches"] });
      void qc.invalidateQueries({ queryKey: ["notes"] });
      void qc.invalidateQueries({ queryKey: ["habitudes"] });
    },
  });
}

export function useIaExecuteActionsMutation(espaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actions: IaExecutableAction[]) =>
      iaApi.executeActions(espaceId!, actions),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["finances"] });
      void qc.invalidateQueries({ queryKey: ["depenses"] });
      void qc.invalidateQueries({ queryKey: ["revenus"] });
      void qc.invalidateQueries({ queryKey: ["taches"] });
      void qc.invalidateQueries({ queryKey: ["notes"] });
      void qc.invalidateQueries({ queryKey: ["habitudes"] });
    },
  });
}

export function useIaDeleteConversationMutation(espaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => iaApi.deleteConversation(espaceId!, id),
    onSuccess: () => {
      if (espaceId) {
        void qc.invalidateQueries({
          queryKey: iaKeys.conversations(espaceId),
        });
      }
    },
    onSettled: () => {
      if (espaceId) {
        void qc.invalidateQueries({
          queryKey: iaKeys.status(espaceId),
        });
      }
      void qc.invalidateQueries({ queryKey: ["subscriptions", "me"] });
    },
  });
}
