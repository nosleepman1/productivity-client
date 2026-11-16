import type { PaginationQuery } from "@/types/common/pagination.types";

export type PrioriteTache = "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE";

/** Tâche rattachée à un espace de travail retournée par l'API. */
export interface Tache {
  id: string;
  titre: string;
  description: string;
  estTerminee: boolean;
  priorite?: PrioriteTache;
  rappelActif?: boolean;
  syncCalendrier?: boolean;
  projetId?: string | null;
  projet?: { id: string; titre: string } | null;
  dateLimite: string;
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données requises pour créer une tâche. */
export interface CreateTacheDto {
  titre: string;
  description?: string;
  dateLimite: string;
  estTerminee?: boolean;
  priorite?: PrioriteTache;
  rappelActif?: boolean;
  syncCalendrier?: boolean;
  projetId?: string | null;
}

/** Données pour modifier partiellement une tâche. */
export type UpdateTacheDto = Partial<CreateTacheDto>;

/** Paramètres de requête et tri pour la liste des tâches. */
export interface QueryTachesDto extends PaginationQuery {
  tri?: "dateLimite" | "createdAt" | "titre";
  projetId?: string;
}
