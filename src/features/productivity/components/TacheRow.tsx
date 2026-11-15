import { CalendarClock, Check, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { formatDateUtc } from "@/features/finances/utils/format";
import { getDeadlineBadge } from "@/features/productivity/utils/dates";
import type { Tache } from "@/types/productivity";

/** Propriétés d'une ligne de tâche. */
export interface TacheRowProps {
  /** Entité tâche retournée par l'API. */
  tache: Tache;
  /** Index dans la liste pour l'animation échelonnée. */
  index?: number;
  /** Bascule l'état `estTerminee`. */
  onToggle: (tache: Tache) => void;
  /** Ouvre le formulaire d'édition. */
  onEdit: (tache: Tache) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (tache: Tache) => void;
}

const URGENCY_STYLES = {
  completed: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  overdue: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  soon: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  normal: "bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
};

/**
 * Ligne de tâche Apple-style avec case à cocher animée par ressort,
 * badge d'échéance et actions d'édition / suppression.
 */
export function TacheRow({
  tache,
  index = 0,
  onToggle,
  onEdit,
  onDelete,
}: TacheRowProps) {
  const badge = getDeadlineBadge(tache.dateLimite, tache.estTerminee);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        delay: Math.min(index * 0.03, 0.2),
      }}
      className="apple-surface flex items-start justify-between gap-3 rounded-2xl p-3.5 transition-shadow hover:shadow-md sm:px-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(tache)}
          aria-label={
            tache.estTerminee
              ? `Marquer "${tache.titre}" comme à faire`
              : `Marquer "${tache.titre}" comme terminée`
          }
          className="apple-press mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-[var(--bg-subtle)]"
        >
          <motion.span
            animate={{
              scale: tache.estTerminee ? 1 : 0.95,
              backgroundColor: tache.estTerminee
                ? "var(--accent)"
                : "transparent",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
              tache.estTerminee
                ? "border-[var(--accent)] text-white"
                : "border-[var(--text-secondary)]/50"
            }`}
          >
            {tache.estTerminee && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </motion.span>
        </button>

        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              tache.estTerminee
                ? "line-through text-[var(--text-secondary)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            {tache.titre}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
            {tache.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${URGENCY_STYLES[badge.urgency]}`}
            >
              <CalendarClock className="h-3 w-3" />
              {badge.label}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Échéance : {formatDateUtc(tache.dateLimite)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(tache)}
          aria-label={`Modifier ${tache.titre}`}
          className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(tache)}
          aria-label={`Supprimer ${tache.titre}`}
          className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
