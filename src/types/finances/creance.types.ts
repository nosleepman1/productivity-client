import type { Contact } from "@/types/contacts";
import type { StatutSuivi } from "./commun.types";
import type { Paiement } from "./paiement.types";

/** Créance (argent dû à l'utilisateur) retournée par l'API. */
export interface Creance {
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

/** Données pour créer une créance. */
export interface CreateCreanceDto {
  montant: number;
  description: string;
  date?: string;
  datePromise?: string | null;
  contactId?: string | null;
}

/** Données pour modifier une créance. */
export type UpdateCreanceDto = Partial<CreateCreanceDto>;

/** Payload de relance WhatsApp généré par `GET /creances/:id/relance`. */
export interface RelanceCreance {
  message: string;
  lien: string;
  telephone: string;
}
