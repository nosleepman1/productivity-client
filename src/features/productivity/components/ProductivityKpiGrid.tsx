import {
  AlertCircle,
  CheckSquare,
  FolderKanban,
  StickyNote,
} from "lucide-react";
import { motion } from "motion/react";

/** Propriétés de la grille de KPI du module Productivité. */
export interface ProductivityKpiGridProps {
  /** Nombre de projets actifs (non terminés). */
  projetsActifs: number;
  /** Nombre total de projets. */
  projetsTotal: number;
  /** Nombre de tâches restantes à faire. */
  tachesRestantes: number;
  /** Nombre de tâches terminées. */
  tachesTerminees: number;
  /** Nombre de tâches dont la date limite est dépassée. */
  tachesEnRetard: number;
  /** Nombre de notes enregistrées dans l'espace. */
  notesTotal: number;
}

/**
 * Grille de 4 cartes KPI animées pour Projets, Tâches, Retards et Notes.
 */
export function ProductivityKpiGrid({
  projetsActifs,
  projetsTotal,
  tachesRestantes,
  tachesTerminees,
  tachesEnRetard,
  notesTotal,
}: ProductivityKpiGridProps) {
  const cards = [
    {
      id: "projets",
      label: "Projets actifs",
      value: projetsActifs,
      sub: `sur ${projetsTotal} projet${projetsTotal > 1 ? "s" : ""} au total`,
      icon: FolderKanban,
      tint: "bg-[var(--accent)]/12 text-[var(--accent)]",
    },
    {
      id: "taches",
      label: "Tâches à faire",
      value: tachesRestantes,
      sub: `${tachesTerminees} terminée${tachesTerminees > 1 ? "s" : ""}`,
      icon: CheckSquare,
      tint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "retards",
      label: "Échéances dépassées",
      value: tachesEnRetard,
      sub: tachesEnRetard > 0 ? "Action prioritaire requise" : "Tout est à jour",
      icon: AlertCircle,
      tint:
        tachesEnRetard > 0
          ? "bg-rose-500/12 text-rose-500"
          : "bg-sky-500/12 text-sky-600 dark:text-sky-400",
      valueClass: tachesEnRetard > 0 ? "text-rose-500" : undefined,
    },
    {
      id: "notes",
      label: "Notes & Idées",
      value: notesTotal,
      sub: "Centralisées dans l'espace",
      icon: StickyNote,
      tint: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 28,
              delay: index * 0.05,
            }}
            whileHover={{ y: -2 }}
            className="apple-surface rounded-2xl p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {card.label}
              </span>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${card.tint}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div
              className={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${
                card.valueClass ?? "text-[var(--text-primary)]"
              }`}
            >
              {card.value}
            </div>

            <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
              {card.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
