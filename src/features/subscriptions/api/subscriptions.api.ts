import { api } from "@/api/api";

export type MethodePaiementAbonnement = "MANUAL_WAVE" | "DEXPAY_SANDBOX";

export type StatutPaiementAbonnement =
  | "PENDING"
  | "PENDING_VERIFICATION"
  | "PAID"
  | "CONFIRMED"
  | "FAILED"
  | "REJECTED"
  | "CANCELLED";

export interface PlanAbonnement {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  prixFcfa: number;
  devise: string;
  quotaIaJour: number;
  dureeJours: number;
  avantages: string[];
  ordre: number;
  actif: boolean;
}

export interface AiQuotaStatus {
  planCode: string;
  planNom: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  dateKey: string;
}

export interface AbonnementRecord {
  id: string;
  statut: "ACTIVE" | "EXPIRED" | "CANCELLED";
  debutAt: string;
  finAt: string | null;
  plan: PlanAbonnement;
}

export interface PaiementAbonnement {
  id: string;
  planId: string;
  montantFcfa: number;
  devise?: string;
  methode: MethodePaiementAbonnement;
  statut: StatutPaiementAbonnement;
  telephonePayeur?: string | null;
  referenceExterne?: string | null;
  preuveNote?: string | null;
  checkoutUrl?: string | null;
  createdAt: string;
  validatedAt?: string | null;
  plan?: {
    id: string;
    code: string;
    nom: string;
    prixFcfa: number;
  };
}

export interface MySubscriptionSummary {
  abonnement: AbonnementRecord | null;
  plan: PlanAbonnement;
  quota: AiQuotaStatus;
  paiements: PaiementAbonnement[];
}

export interface PaymentMethodInfo {
  methode: MethodePaiementAbonnement;
  configured: boolean;
}

export interface InitiatePaymentPayload {
  planId: string;
  methode: MethodePaiementAbonnement;
  telephonePayeur?: string;
  referenceExterne?: string;
  preuveNote?: string;
}

export interface InitiatePaymentResponse {
  payment: PaiementAbonnement;
  checkout: {
    statut?: string;
    checkoutUrl?: string | null;
    referenceExterne?: string | null;
    instructions?: string | null;
  };
}

export const subscriptionsApi = {
  getPlans: async (): Promise<PlanAbonnement[]> => {
    const { data } = await api.get<PlanAbonnement[]>("/subscriptions/plans");
    return data;
  },

  getMySubscription: async (): Promise<MySubscriptionSummary> => {
    const { data } = await api.get<MySubscriptionSummary>("/subscriptions/me");
    return data;
  },

  getPaymentMethods: async (): Promise<PaymentMethodInfo[]> => {
    const { data } = await api.get<PaymentMethodInfo[]>("/payments/methods");
    return data;
  },

  initiatePayment: async (
    payload: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> => {
    const { data } = await api.post<InitiatePaymentResponse>(
      "/payments/checkout",
      payload,
    );
    return data;
  },

  getTodayQuote: async (): Promise<DailyQuote | null> => {
    const { data } = await api.get<DailyQuote | null>("/quotes/today");
    return data;
  },

  getRandomQuote: async (excludeId?: string): Promise<DailyQuote | null> => {
    const { data } = await api.get<DailyQuote | null>("/quotes/random", {
      params: excludeId ? { excludeId } : undefined,
    });
    return data;
  },
};

export interface DailyQuote {
  id: string;
  contenu: string;
  auteur: string;
  categorie: string;
  categorieLabel?: string;
}
