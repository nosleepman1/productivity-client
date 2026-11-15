import type { Contact } from "@/types/contacts";
import type { StatutSuivi } from "./commun.types";
import type { Paiement } from "./paiement.types";

/** Dette (argent que l'utilisateur doit rembourser) retournée par l'API. */
export interface Dette {
  id: string;
  montant: number;
  montantPaye: number;
  reste: number;
  statut: StatutSuivi;
  description: string;
  date: string;
  datePromise: string | null;
  contactId: string | null;
  contact?: Pick<Contact, "id" | "nom" | "telephone"> | null;
  paiements?: Paiement[];
  espaceId: string;
  createdAt: string;
  updatedAt: string;
}

/** Données pour créer une dette. */
export interface CreateDetteDto {
  montant: number;
  description: string;
  date?: string;
  datePromise?: string | null;
  contactId?: string | null;
}

/** Données pour modifier une dette. */
export type UpdateDetteDto = Partial<CreateDetteDto>;
