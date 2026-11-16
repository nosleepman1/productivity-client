import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { formatFcfa } from "@/features/finances/utils/format";

/** Propriétés du graphique de flux financiers. */
export interface CashFlowChartProps {
  /** Cumul des revenus (FCFA). */
  totalRevenus: number;
  /** Cumul des dépenses (FCFA). */
  totalDepenses: number;
  /** Total restant sur les créances (FCFA). */
  totalCreancesRestant: number;
  /** Total restant sur les dettes (FCFA). */
  totalDettesRestant: number;
}

/**
 * Visualisation SVG légère et animée des flux financiers :
 * jauge circulaire du taux d'épargne + barres comparatives Revenus / Dépenses et Créances / Dettes.
 */
export function CashFlowChart({
  totalRevenus,
  totalDepenses,
  totalCreancesRestant,
  totalDettesRestant,
}: CashFlowChartProps) {
  const { t } = useTranslation();
  const maxFlow = Math.max(totalRevenus, totalDepenses, 1);
  const revWidth = Math.round((totalRevenus / maxFlow) * 100);
  const depWidth = Math.round((totalDepenses / maxFlow) * 100);

  const savingsRate =
    totalRevenus > 0
      ? Math.max(-100, Math.min(100, Math.round(((totalRevenus - totalDepenses) / totalRevenus) * 100)))
      : 0;
  const clampedRing = Math.max(0, Math.min(100, savingsRate));

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedRing / 100) * circumference;

  const maxSuivi = Math.max(totalCreancesRestant, totalDettesRestant, 1);
  const creancesWidth = Math.round((totalCreancesRestant / maxSuivi) * 100);
  const dettesWidth = Math.round((totalDettesRestant / maxSuivi) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.12 }}
      aria-label={t("financesExtra.chart.ariaLabel")}
      className="apple-surface grid grid-cols-1 gap-5 rounded-3xl p-5 md:grid-cols-[auto_1fr]"
    >
      {/* Anneau SVG animé du taux d'épargne */}
      <div className="flex items-center gap-4 md:border-r md:border-[var(--border-subtle)] md:pr-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 84 84"
            className="h-24 w-24 -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="8"
            />
            <motion.circle
              cx="42"
              cy="42"
              r={radius}
              fill="none"
              stroke={savingsRate >= 0 ? "#10b981" : "#f43f5e"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
              {savingsRate}%
            </span>
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">
              {t("financesExtra.chart.savings")}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {t("financesExtra.chart.cashflowRatio")}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
            {savingsRate >= 20
              ? t("financesExtra.chart.healthyBalance")
              : savingsRate >= 0
                ? t("financesExtra.chart.moderateMargin")
                : t("financesExtra.chart.expensesHigher")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            {t("financesExtra.chart.savingsDesc")}
          </p>
        </div>
      </div>

      {/* Barres animées Revenus/Dépenses & Créances/Dettes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)]">
                {t("dashboard.revenues")}
              </span>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatFcfa(totalRevenus)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revWidth}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)]">
                {t("dashboard.expenses")}
              </span>
              <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {formatFcfa(totalDepenses)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${depWidth}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                className="h-full rounded-full bg-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)]">
                {t("financesExtra.chart.receivablesToCollect")}
              </span>
              <span className="font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                {formatFcfa(totalCreancesRestant)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${creancesWidth}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                className="h-full rounded-full bg-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)]">
                {t("financesExtra.chart.debtsToRepay")}
              </span>
              <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {formatFcfa(totalDettesRestant)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dettesWidth}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
