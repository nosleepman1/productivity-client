/** Niveau d'urgence calculé pour une échéance de tâche ou projet. */
export type DeadlineUrgency = "completed" | "overdue" | "soon" | "normal";

/**
 * Calcule le nombre de jours calendaires restants (en UTC) jusqu'à une date limite.
 *
 * @param iso - Date limite au format ISO.
 * @returns Entier signé (négatif si dépassée, `0` si aujourd'hui).
 */
export function getDaysRemainingUtc(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );

  return Math.round((targetUtc - todayUtc) / 86_400_000);
}

/**
 * Détermine l'urgence et le libellé court d'une échéance pour l'UI.
 *
 * @param iso - Date limite ISO.
 * @param isDone - Indique si l'élément est déjà terminé.
 * @returns Niveau d'urgence et texte lisible en français.
 */
export function getDeadlineBadge(
  iso: string | null | undefined,
  isDone: boolean,
): { urgency: DeadlineUrgency; label: string } {
  if (isDone) {
    return { urgency: "completed", label: "Terminé" };
  }

  const days = getDaysRemainingUtc(iso);
  if (days === null) {
    return { urgency: "normal", label: "Sans échéance" };
  }
  if (days < 0) {
    const abs = Math.abs(days);
    return {
      urgency: "overdue",
      label: `En retard (${abs} j)`,
    };
  }
  if (days === 0) {
    return { urgency: "soon", label: "Aujourd'hui" };
  }
  if (days <= 3) {
    return { urgency: "soon", label: `Dans ${days} j` };
  }
  return { urgency: "normal", label: `Dans ${days} j` };
}
