/** Entrée de dépense retournée par l'API. */
export interface Depense {
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

/** Données pour créer une dépense (montant entier en FCFA). */
export interface CreateDepenseDto {
  montant: number;
  description: string;
  categorie?: string;
  moyenPaiement?: string;
  projetId?: string | null;
  date?: string;
}

/** Données pour modifier partiellement une dépense. */
export type UpdateDepenseDto = Partial<CreateDepenseDto>;
