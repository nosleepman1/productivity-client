import type { PaginationQuery } from "@/types/common/pagination.types";

/** Statut calculé d'une dette ou d'une créance. */
export type StatutSuivi = "EN_COURS" | "EN_RETARD" | "SOLDEE";

/** Paramètres de requête communs aux revenus et dépenses. */
export interface QueryTransactionsDto extends PaginationQuery {
  tri?: "date" | "montant" | "createdAt";
  du?: string;
  au?: string;
}

/** Paramètres de requête communs aux dettes et créances. */
export interface QuerySuiviDto extends PaginationQuery {
  tri?: "date" | "montant" | "datePromise";
  du?: string;
  au?: string;
  statut?: StatutSuivi;
}

/** Agrégat de suivi retourné par `GET /dettes/resume` et `GET /creances/resume`. */
export interface ResumeSuivi {
  /** Somme totale restant à payer ou à encaisser (FCFA). */
  totalRestant: number;
  /** Nombre de dossiers en cours (non échus). */
  nombreEnCours: number;
  /** Nombre de dossiers dont la date promise est dépassée. */
  nombreEnRetard: number;
  /** Montant cumulé des dossiers en retard (FCFA). */
  montantEnRetard: number;
  /** Nombre de dossiers intégralement soldés. */
  nombreSoldees: number;
}
