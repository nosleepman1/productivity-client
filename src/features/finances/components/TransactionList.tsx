import { Plus, ReceiptText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Depense, Revenu } from "@/types/finances";
import { FinanceListSkeleton } from "./FinanceSkeletons";
import { TransactionRow } from "./TransactionRow";

/** Propriétés de la liste de revenus ou dépenses. */
export interface TransactionListProps {
  /** Nature des transactions affichées. */
  kind: "revenu" | "depense";
  /** Liste des transactions de la page courante. */
  items: (Revenu | Depense)[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Callback pour créer une nouvelle transaction. */
  onCreate: () => void;
  /** Callback pour modifier une transaction. */
  onEdit: (item: Revenu | Depense) => void;
  /** Callback pour supprimer une transaction. */
  onDelete: (item: Revenu | Depense) => void;
}

/**
 * Liste animée des revenus ou dépenses avec état vide et squelette de chargement.
 */
export function TransactionList({
  kind,
  items,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return <FinanceListSkeleton count={4} />;
  }

  if (items.length === 0) {
    const isRev = kind === "revenu";
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <ReceiptText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          {isRev
            ? t("financesExtra.empty.noRevenue")
            : t("financesExtra.empty.noExpense")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          {isRev
            ? t("financesExtra.empty.noRevenueDesc")
            : t("financesExtra.empty.noExpenseDesc")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {isRev
            ? t("financesExtra.empty.addRevenue")
            : t("financesExtra.empty.addExpense")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence mode="popLayout">
        {items.map((item, idx) => (
          <TransactionRow
            key={item.id}
            kind={kind}
            item={item}
            index={idx}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
