/** Entrée de revenu retournée par l'API. */
export interface Revenu {
  id: string;
  montant: number;
  description: string;
  categorie?: string;
  moyenPaiement?: string;
  projetId?: string | null;
  projet?: { id: string; titre: string } | null;
  date: string;
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données pour créer un revenu (montant entier en FCFA). */
export interface CreateRevenuDto {
  montant: number;
  description: string;
  categorie?: string;
  moyenPaiement?: string;
  projetId?: string | null;
  date?: string;
}

/** Données pour modifier partiellement un revenu. */
export type UpdateRevenuDto = Partial<CreateRevenuDto>;
