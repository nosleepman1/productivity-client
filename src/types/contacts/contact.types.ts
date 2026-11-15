import type { PaginationQuery } from "@/types/common/pagination.types";

/** Catégorie métier d'un contact. */
export type ContactType = "CLIENT" | "FOURNISSEUR" | "PARTENAIRE" | "AUTRE";

/** Représentation d'un contact retournée par l'API. */
export interface Contact {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  type: ContactType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Données pour créer un contact. */
export interface CreateContactDto {
  nom: string;
  telephone?: string | null;
  email?: string | null;
  type?: ContactType;
  notes?: string | null;
}

/** Données pour modifier un contact. */
export type UpdateContactDto = Partial<CreateContactDto>;

/** Paramètres de recherche et pagination des contacts. */
export interface QueryContactsDto extends PaginationQuery {
  tri?: "nom" | "createdAt";
  type?: ContactType;
  recherche?: string;
}
