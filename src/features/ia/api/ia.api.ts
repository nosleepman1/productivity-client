import { api } from "@/api/api";
import type { AiQuotaStatus } from "@/features/subscriptions/api/subscriptions.api";

export type IaProviderId = "deepseek" | "gemini";

export interface IaProviderInfo {
  id: IaProviderId;
  model: string;
  configured: boolean;
}

export interface IaStatusResponse {
  defaultProvider: IaProviderId;
  providers: IaProviderInfo[];
  quota?: AiQuotaStatus;
}

export type IaActionType =
  | "depense"
  | "revenu"
  | "tache"
  | "note"
  | "toggle_tache"
  | "toggle_habitude";

export interface IaExecutableAction {
  type: IaActionType;
  titre: string;
  montant?: number | null;
  categorie?: string | null;
  moyenPaiement?: "WAVE" | "ORANGE_MONEY" | "ESPECES" | "BANQUE" | null;
  date?: string | null;
  priorite?: "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE" | null;
  description?: string | null;
  targetId?: string | null;
}

export interface IaChatResponse {
  conversationId: string;
  reply: string;
  provider: IaProviderId;
  model: string;
  toolsUsed: string[];
  proposedAction: IaExecutableAction | null;
  proposedActions?: IaExecutableAction[];
}

export interface IaExecuteActionResponse {
  type: IaActionType;
  executed: boolean;
  record: unknown;
}

export interface IaConversationSummary {
  id: string;
  titre: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface IaMessageRecord {
  id: string;
  role: "USER" | "ASSISTANT";
  contenu: string;
  provider: string | null;
  modele: string | null;
  actionProposee?: IaExecutableAction | null;
  createdAt: string;
}

export interface IaConversationDetail extends IaConversationSummary {
  messages: IaMessageRecord[];
}

export const iaApi = {
  getStatus: async (espaceId: string): Promise<IaStatusResponse> => {
    const { data } = await api.get<IaStatusResponse>(
      `/espaces/${espaceId}/ia/status`,
    );
    return data;
  },

  chat: async (
    espaceId: string,
    payload: {
      message: string;
      conversationId?: string;
      provider?: IaProviderId;
    },
  ): Promise<IaChatResponse> => {
    const { data } = await api.post<IaChatResponse>(
      `/espaces/${espaceId}/ia/chat`,
      payload,
    );
    return data;
  },

  executeAction: async (
    espaceId: string,
    action: IaExecutableAction,
  ): Promise<IaExecuteActionResponse> => {
    const { data } = await api.post<IaExecuteActionResponse>(
      `/espaces/${espaceId}/ia/execute-action`,
      action,
    );
    return data;
  },

  executeActions: async (
    espaceId: string,
    actions: IaExecutableAction[],
  ): Promise<{ executed: boolean; count: number }> => {
    const { data } = await api.post<{ executed: boolean; count: number }>(
      `/espaces/${espaceId}/ia/execute-actions`,
      { actions },
    );
    return data;
  },

  listConversations: async (
    espaceId: string,
  ): Promise<IaConversationSummary[]> => {
    const { data } = await api.get<IaConversationSummary[]>(
      `/espaces/${espaceId}/ia/conversations`,
    );
    return data;
  },

  getConversation: async (
    espaceId: string,
    id: string,
  ): Promise<IaConversationDetail> => {
    const { data } = await api.get<IaConversationDetail>(
      `/espaces/${espaceId}/ia/conversations/${id}`,
    );
    return data;
  },

  deleteConversation: async (
    espaceId: string,
    id: string,
  ): Promise<{ deleted: boolean; id: string }> => {
    const { data } = await api.delete<{ deleted: boolean; id: string }>(
      `/espaces/${espaceId}/ia/conversations/${id}`,
    );
    return data;
  },
};
