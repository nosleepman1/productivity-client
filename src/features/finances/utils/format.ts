import { extractApiError } from "@/api/api";

/**
 * Formate un montant entier en FCFA avec séparateur de milliers.
 * @param amount Montant entier en FCFA.
 * @returns Chaîne formatée ex: `"25 000 FCFA"`.
 */
export function formatFcfa(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

/**
 * Formate une date ISO en date lisible UTC (sans décalage de fuseau horaire).
 * @param iso Chaîne ISO renvoyée par l'API.
 * @returns Date formatée ex: `"15 nov. 2026"`.
 */
export function formatDateUtc(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Convertit une date ISO en valeur `YYYY-MM-DD` pour `<input type="date" />`.
 * @param iso Chaîne ISO optionnelle.
 * @returns Chaîne `YYYY-MM-DD` ou chaîne vide.
 */
export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/**
 * Calcule le pourcentage de remboursement/recouvrement borné entre 0 et 100.
 * @param paid Montant déjà payé.
 * @param total Montant total initial.
 */
export function computeProgressPercent(paid: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((paid / total) * 100)));
}

/**
 * Extrait un message d'erreur lisible depuis une exception API NestJS.
 * @param err Erreur interceptée par TanStack Query ou Axios.
 * @returns Chaîne unique prête pour un toast utilisateur.
 */
export function getApiErrorMessage(err: unknown): string {
  const { message } = extractApiError(err);
  return Array.isArray(message) ? message.join(" · ") : message;
}
