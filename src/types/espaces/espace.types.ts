import type { PaginationQuery } from "@/types/common/pagination.types";

export type EspaceType = "PERSONAL" | "ENTREPRISE" | "OTHER";

export interface Espace {
  id: string;
  nom: string;
  description: string | null;
  type: EspaceType;
  couleur: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEspaceDto {
  nom: string;
  description?: string;
  type: EspaceType;
  couleur?: string;
  icon?: string;
}

export type UpdateEspaceDto = Partial<CreateEspaceDto>;

export interface QueryEspacesDto extends PaginationQuery {
  tri?: "nom" | "createdAt";
}
