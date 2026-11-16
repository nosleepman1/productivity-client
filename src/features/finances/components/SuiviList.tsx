import { HandCoins, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Creance, Dette } from "@/types/finances";
import { FinanceListSkeleton } from "./FinanceSkeletons";
import { SuiviCard } from "./SuiviCard";

/** Propriétés de la liste de dettes ou créances. */
export interface SuiviListProps {
  /** Nature du suivi affiché. */
  kind: "dette" | "creance";
  /** Dossiers retournés par l'API. */
  items: (Dette | Creance)[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Crée un nouveau dossier. */
  onCreate: () => void;
  /** Ouvre la modale des paiements. */
  onOpenPaiements: (item: Dette | Creance) => void;
  /** Ouvre la modale de relance WhatsApp (créances). */
  onOpenRelance?: (item: Creance) => void;
  /** Ouvre l'édition d'un dossier. */
  onEdit: (item: Dette | Creance) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (item: Dette | Creance) => void;
}

/**
 * Liste animée des dettes ou créances avec état vide et squelettes de chargement.
 */
export function SuiviList({
  kind,
  items,
  isLoading,
  onCreate,
  onOpenPaiements,
  onOpenRelance,
  onEdit,
  onDelete,
}: SuiviListProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return <FinanceListSkeleton count={3} />;
  }

  if (items.length === 0) {
    const isDette = kind === "dette";
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <HandCoins className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          {isDette
            ? t("financesExtra.empty.noDebt")
            : t("financesExtra.empty.noReceivable")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          {isDette
            ? t("financesExtra.empty.noDebtDesc")
            : t("financesExtra.empty.noReceivableDesc")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {isDette
            ? t("financesExtra.empty.newDebt")
            : t("financesExtra.empty.newReceivable")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, idx) => (
          <SuiviCard
            key={item.id}
            kind={kind}
            item={item}
            index={idx}
            onOpenPaiements={onOpenPaiements}
            onOpenRelance={onOpenRelance}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
