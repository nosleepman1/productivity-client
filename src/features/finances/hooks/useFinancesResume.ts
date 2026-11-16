import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface BudgetEnrichi {
  id: string;
  categorie: string;
  montantPlafond: number;
  depenseMois: number;
  pourcentage: number;
}

export interface MouvementRecentResume {
  id: string;
  kind: "revenu" | "depense";
  sousType:
    | "REVENU"
    | "DEPENSE"
    | "ENCAISSEMENT_CREANCE"
    | "REMBOURSEMENT_DETTE";
  description: string;
  montant: number;
  categorie: string;
  moyenPaiement: string;
  projetTitre: string | null;
  date: string;
}

export interface FinancesResumeData {
  totalRevenus: number;
  totalDepenses: number;
  revenusDirects: number;
  depensesDirectes: number;
  encaissementsCreances: number;
  remboursementsDettes: number;
  soldeNet: number;
  nombreRevenus: number;
  nombreDepenses: number;
  revenusMoisCourant: number;
  depensesMoisCourant: number;
  parCategorieDepenses: { categorie: string; montant: number }[];
  parMoyenPaiement: { moyenPaiement: string; montant: number }[];
  budgets: BudgetEnrichi[];
  mouvementsRecents: MouvementRecentResume[];
}

export const CATEGORIES_DEPENSES = [
  { id: "ALIMENTATION", label: "Alimentation" },
  { id: "TRANSPORT", label: "Transport" },
  { id: "LOGEMENT", label: "Logement / Loyer" },
  { id: "FACTURES", label: "Factures (Woyofal, Eau, Internet)" },
  { id: "SANTE", label: "Santé" },
  { id: "BUSINESS", label: "Business / Activité" },
  { id: "LOISIRS", label: "Loisirs & Sorties" },
  { id: "AUTRE", label: "Autre" },
] as const;

export const CATEGORIES_REVENUS = [
  { id: "SALAIRE", label: "Salaire" },
  { id: "VENTE", label: "Vente / Commerce" },
  { id: "FREELANCE", label: "Prestation / Freelance" },
  { id: "INVESTISSEMENT", label: "Investissement" },
  { id: "AUTRE", label: "Autre" },
] as const;

export const MOYENS_PAIEMENT = [
  { id: "WAVE", label: "Wave" },
  { id: "ORANGE_MONEY", label: "Orange Money" },
  { id: "ESPECES", label: "Espèces" },
  { id: "BANQUE", label: "Banque / Carte" },
] as const;

export function useFinancesResume(espaceId: string | null) {
  return useQuery({
    queryKey: ["finances", "resume", espaceId],
    queryFn: async () => {
      const { data } = await api.get<FinancesResumeData>(
        `/espaces/${espaceId}/finances/resume`,
      );
      return data;
    },
    enabled: Boolean(espaceId),
  });
}

export function useUpsertBudgetMutation(espaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { categorie: string; montantPlafond: number }) => {
      const { data } = await api.post(
        `/espaces/${espaceId}/finances/budgets`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["finances", "resume", espaceId],
      });
    },
  });
}

export function useDeleteBudgetMutation(espaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categorie: string) => {
      const { data } = await api.delete(
        `/espaces/${espaceId}/finances/budgets/${encodeURIComponent(categorie)}`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["finances", "resume", espaceId],
      });
    },
  });
}
