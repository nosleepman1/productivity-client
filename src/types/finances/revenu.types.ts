/** Entrée de revenu retournée par l'API. */
export interface Revenu {
  id: string;
  montant: number;
  description: string;
  date: string;
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données pour créer un revenu (montant entier en FCFA). */
export interface CreateRevenuDto {
  montant: number;
  description: string;
  date?: string;
}

/** Données pour modifier partiellement un revenu. */
export type UpdateRevenuDto = Partial<CreateRevenuDto>;
