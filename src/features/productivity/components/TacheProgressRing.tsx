import { motion } from "motion/react";

/** Propriétés de l'anneau de progression des tâches. */
export interface TacheProgressRingProps {
  /** Nombre de tâches complétées. */
  completed: number;
  /** Nombre total de tâches. */
  total: number;
}

/**
 * Anneau SVG léger et animé affichant le taux d'accomplissement des tâches.
 */
export function TacheProgressRing({ completed, total }: TacheProgressRingProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="apple-surface flex items-center gap-4 rounded-3xl p-4 sm:p-5"
    >
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="7"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="absolute text-sm font-bold tabular-nums text-[var(--text-primary)]">
          {percent}%
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Avancement global
        </p>
        <p className="mt-0.5 text-base font-semibold text-[var(--text-primary)] tabular-nums">
          {completed} / {total} tâche{total > 1 ? "s" : ""} complétée{completed > 1 ? "s" : ""}
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          {percent === 100 && total > 0
            ? "Toutes les tâches de cette liste sont terminées."
            : "Cochez une tâche pour mettre à jour votre progression."}
        </p>
      </div>
    </motion.div>
  );
}
