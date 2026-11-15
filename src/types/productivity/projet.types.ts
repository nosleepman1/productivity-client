import type { PaginationQuery } from "@/types/common/pagination.types";

/** Projet rattaché à un espace de travail retourné par l'API. */
export interface Projet {
  id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  estTermine: boolean;
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données requises pour créer un projet. */
export interface CreateProjetDto {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  estTermine?: boolean;
}

/** Données pour modifier partiellement un projet. */
export type UpdateProjetDto = Partial<CreateProjetDto>;

/** Paramètres de requête et tri pour la liste des projets. */
export interface QueryProjetsDto extends PaginationQuery {
  tri?: "createdAt" | "dateDebut" | "titre";
}
