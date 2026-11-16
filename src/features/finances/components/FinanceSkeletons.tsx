import { motion } from "motion/react";

/**
 * Squelette de chargement animé pour la grille des 4 cartes KPI financières.
 */
export function FinanceKpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: idx * 0.1,
            ease: "easeInOut",
          }}
          className="apple-surface rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-full bg-[var(--border-subtle)]" />
            <div className="h-8 w-8 rounded-xl bg-[var(--border-subtle)]" />
          </div>
          <div className="mt-4 h-7 w-32 rounded-lg bg-[var(--border-subtle)]" />
          <div className="mt-2 h-3 w-24 rounded-full bg-[var(--border-subtle)]" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Squelette de chargement pour une liste de transactions ou de dossiers de suivi.
 *
 * @param count - Nombre de lignes factices à afficher (par défaut 4).
 */
export function FinanceListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: idx * 0.08,
            ease: "easeInOut",
          }}
          className="apple-surface flex items-center justify-between gap-4 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--border-subtle)]" />
            <div className="space-y-2">
              <div className="h-3.5 w-44 rounded-full bg-[var(--border-subtle)]" />
              <div className="h-3 w-28 rounded-full bg-[var(--border-subtle)]" />
            </div>
          </div>
          <div className="h-5 w-24 rounded-lg bg-[var(--border-subtle)]" />
        </motion.div>
      ))}
    </div>
  );
}
