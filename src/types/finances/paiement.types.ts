/** Paiement partiel ou total associé à une dette ou une créance. */
export interface Paiement {
  id: string;
  montant: number;
  date: string;
  note: string | null;
  createdAt: string;
}

/** Données requises pour enregistrer un paiement (FCFA entier positif). */
export interface CreatePaiementDto {
  montant: number;
  date?: string;
  note?: string;
}
