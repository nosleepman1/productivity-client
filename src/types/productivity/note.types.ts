import type { PaginationQuery } from "@/types/common/pagination.types";

/** Note (ou idée) rattachée à un espace de travail retournée par l'API. */
export interface Note {
  id: string;
  titre: string;
  contenu: string;
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données requises pour créer une note. */
export interface CreateNoteDto {
  titre: string;
  contenu: string;
}

/** Données pour modifier partiellement une note. */
export type UpdateNoteDto = Partial<CreateNoteDto>;

/** Paramètres de requête et tri pour la liste des notes. */
export interface QueryNotesDto extends PaginationQuery {
  tri?: "updatedAt" | "createdAt" | "titre";
}
