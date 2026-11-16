import {
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { formatFcfa } from "@/features/finances/utils/format";

/** Propriétés de la grille de KPI financiers. */
export interface FinanceKpiGridProps {
  /** Total des revenus sur la vue/période courante (FCFA). */
  totalRevenus: number;
  /** Total des dépenses sur la vue/période courante (FCFA). */
  totalDepenses: number;
  /** Total restant à rembourser sur les dettes (FCFA). */
  totalDettesRestant: number;
  /** Total restant à encaisser sur les créances (FCFA). */
  totalCreancesRestant: number;
  /** Nombre de dettes en retard. */
  dettesEnRetard?: number;
  /** Nombre de créances en retard. */
  creancesEnRetard?: number;
}

/**
 * Grille de 4 cartes KPI animées pour la vue Finances :
 * Solde net, Revenus, Dépenses et Balance Dettes / Créances.
 */
export function FinanceKpiGrid({
  totalRevenus,
  totalDepenses,
  totalDettesRestant,
  totalCreancesRestant,
  dettesEnRetard = 0,
  creancesEnRetard = 0,
}: FinanceKpiGridProps) {
  const soldeNet = totalRevenus - totalDepenses;
  const balanceSuivi = totalCreancesRestant - totalDettesRestant;
  const totalRetards = dettesEnRetard + creancesEnRetard;

  const cards = [
    {
      id: "solde",
      label: "Solde net",
      value: formatFcfa(soldeNet),
      sub:
        soldeNet >= 0
          ? "Trésorerie positive sur la période"
          : "Déficit sur la période",
      icon: Wallet,
      tint:
        soldeNet >= 0
          ? "bg-[var(--accent)]/12 text-[var(--accent)]"
          : "bg-rose-500/12 text-rose-500",
      valueClass:
        soldeNet >= 0 ? "text-[var(--text-primary)]" : "text-rose-500",
    },
    {
      id: "revenus",
      label: "Revenus",
      value: `+${formatFcfa(totalRevenus)}`,
      sub: "Entrées enregistrées",
      icon: ArrowDownLeft,
      tint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "depenses",
      label: "Dépenses",
      value: `-${formatFcfa(totalDepenses)}`,
      sub: "Sorties enregistrées",
      icon: ArrowUpRight,
      tint: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
    },
    {
      id: "suivi",
      label: "Position Dettes / Créances",
      value: `${balanceSuivi >= 0 ? "+" : ""}${formatFcfa(balanceSuivi)}`,
      sub:
        totalRetards > 0
          ? `${totalRetards} échéance${totalRetards > 1 ? "s" : ""} en retard`
          : `À recevoir ${formatFcfa(totalCreancesRestant)} · À payer ${formatFcfa(totalDettesRestant)}`,
      icon: Scale,
      tint:
        totalRetards > 0
          ? "bg-amber-500/12 text-amber-600 dark:text-amber-400"
          : "bg-sky-500/12 text-sky-600 dark:text-sky-400",
      valueClass:
        totalRetards > 0
          ? "text-amber-600 dark:text-amber-400"
          : "text-[var(--text-primary)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
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
              className={`mt-3 truncate text-xl font-semibold tracking-tight tabular-nums ${card.valueClass}`}
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
