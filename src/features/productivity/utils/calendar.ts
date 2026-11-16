/**
 * Génère un lien direct d'ajout à Google Calendar (1-clic) pour une tâche ou un projet planifié.
 * Fonctionne avec n'importe quel compte Google (même si l'utilisateur s'est connecté par email/mot de passe).
 */
export function buildGoogleCalendarTemplateUrl(params: {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string | null;
}): string {
  const fin = params.endDate
    ? new Date(params.endDate)
    : new Date(params.startDate);
  const debut = params.endDate
    ? new Date(params.startDate)
    : new Date(fin.getTime() - 45 * 60 * 1000);

  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${fmt(debut)}/${fmt(fin)}`);
  if (params.description) {
    url.searchParams.set("details", params.description);
  }
  return url.toString();
}

/**
 * Construit l'URL du flux calendrier .ics privé abonnable dans Google Calendar ou Apple Calendrier iPhone.
 */
export function buildIcsFeedUrl(calendrierToken: string | null | undefined): string | null {
  if (!calendrierToken) return null;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/v1/calendrier/${calendrierToken}/feed.ics`;
}
