import { Calendar, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { formatDateUtc } from "@/features/finances/utils/format";
import { getDeadlineBadge } from "@/features/productivity/utils/dates";
import type { Projet } from "@/types/productivity";

/** Propriétés d'une carte projet. */
export interface ProjetCardProps {
  /** Entité projet retournée par l'API. */
  projet: Projet;
  /** Index dans la liste pour l'animation échelonnée. */
  index?: number;
  /** Bascule l'état terminé/actif du projet. */
  onToggleDone: (projet: Projet) => void;
  /** Ouvre le formulaire d'édition du projet. */
  onEdit: (projet: Projet) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (projet: Projet) => void;
}

const URGENCY_CLASSES = {
  completed: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  overdue: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  soon: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  normal: "bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
};

/**
 * Carte Apple-style animée représentant un projet avec dates, statut et actions rapides.
 */
export function ProjetCard({
  projet,
  index = 0,
  onToggleDone,
  onEdit,
  onDelete,
}: ProjetCardProps) {
  const badge = getDeadlineBadge(projet.dateFin, projet.estTermine);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 28,
        delay: Math.min(index * 0.04, 0.2),
      }}
      whileHover={{ y: -2 }}
      className="apple-surface rounded-3xl p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleDone(projet)}
            aria-label={
              projet.estTermine
                ? `Marquer ${projet.titre} comme actif`
                : `Marquer ${projet.titre} comme terminé`
            }
            className="apple-press mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10"
          >
            {projet.estTermine ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${URGENCY_CLASSES[badge.urgency]}`}
              >
                {badge.label}
              </span>
            </div>

            <h3
              className={`mt-1.5 text-base font-semibold ${
                projet.estTermine
                  ? "line-through text-[var(--text-secondary)]"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {projet.titre}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
              {projet.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(projet)}
            aria-label={`Modifier ${projet.titre}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(projet)}
            aria-label={`Supprimer ${projet.titre}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Début : {formatDateUtc(projet.dateDebut)}
        </span>
        {projet.dateFin && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Fin prévue : {formatDateUtc(projet.dateFin)}
          </span>
        )}
      </div>
    </motion.article>
  );
}
