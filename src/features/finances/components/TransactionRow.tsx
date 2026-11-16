import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { formatDateUtc, formatFcfa } from "@/features/finances/utils/format";
import type { Depense, Revenu } from "@/types/finances";

/** Propriétés d'une ligne de transaction financière (revenu ou dépense). */
export interface TransactionRowProps {
  /** Nature de la transaction affichée. */
  kind: "revenu" | "depense";
  /** Entité revenu ou dépense retournée par l'API. */
  item: Revenu | Depense;
  /** Index dans la liste pour l'animation échelonnée. */
  index?: number;
  /** Déclenche l'ouverture du formulaire d'édition. */
  onEdit: (item: Revenu | Depense) => void;
  /** Déclenche la demande de suppression. */
  onDelete: (item: Revenu | Depense) => void;
}

/**
 * Ligne animée représentant un revenu ou une dépense avec actions rapides d'édition et suppression.
 */
export function TransactionRow({
  kind,
  item,
  index = 0,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isRevenu = kind === "revenu";

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
      className="apple-surface group flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-shadow hover:shadow-md sm:px-4"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isRevenu
              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/12 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isRevenu ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {item.description}
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            {formatDateUtc(item.date)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span
          className={`text-sm font-semibold tabular-nums sm:text-base ${
            isRevenu
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isRevenu ? "+" : "-"}
          {formatFcfa(item.montant)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Modifier ${item.description}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Supprimer ${item.description}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-rose-500/12 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
