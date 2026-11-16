import { api } from "@/api/api";

/** État serveur du service Web Push VAPID. */
export interface PushStatusResponse {
  configured: boolean;
  publicKey: string | null;
  subscriptionCount: number;
}

/** Charge utile d'abonnement Web Push envoyée au backend. */
export interface SubscribePushPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

/**
 * Service client pour l'enregistrement et le test des notifications Web Push PWA.
 */
export const pushService = {
  /** Récupère la clé publique VAPID et le nombre d'appareils abonnés. */
  getStatus: async (): Promise<PushStatusResponse> => {
    const { data } = await api.get<PushStatusResponse>("/push/status");
    return data;
  },

  /** Enregistre l'abonnement Push de l'appareil courant. */
  subscribe: async (payload: SubscribePushPayload): Promise<{ id: string; subscribed: boolean }> => {
    const { data } = await api.post<{ id: string; subscribed: boolean }>(
      "/push/subscribe",
      payload,
    );
    return data;
  },

  /** Supprime l'abonnement Push de l'appareil courant. */
  unsubscribe: async (endpoint: string): Promise<{ removed: boolean }> => {
    const { data } = await api.delete<{ removed: boolean }>("/push/subscribe", {
      data: { endpoint },
    });
    return data;
  },

  /** Déclenche une notification Push de test vers les appareils abonnés. */
  sendTest: async (): Promise<{ sent: number; failed: number; configured: boolean }> => {
    const { data } = await api.post<{
      sent: number;
      failed: number;
      configured: boolean;
    }>("/push/test");
    return data;
  },
};
