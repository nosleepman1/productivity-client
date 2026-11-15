import { CheckSquare, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Tache } from "@/types/productivity";
import { ProductivityListSkeleton } from "./ProductivitySkeletons";
import { TacheRow } from "./TacheRow";

/** Propriétés de la liste des tâches. */
export interface TacheListProps {
  /** Tâches filtrées à afficher. */
  items: Tache[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Déclenche la création d'une tâche. */
  onCreate: () => void;
  /** Bascule l'état terminé d'une tâche. */
  onToggle: (tache: Tache) => void;
  /** Ouvre la modale d'édition. */
  onEdit: (tache: Tache) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (tache: Tache) => void;
}

/**
 * Liste animée des tâches avec état vide et squelette de chargement.
 */
export function TacheList({
  items,
  isLoading,
  onCreate,
  onToggle,
  onEdit,
  onDelete,
}: TacheListProps) {
  if (isLoading) {
    return <ProductivityListSkeleton count={4} />;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <CheckSquare className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          Aucune tâche dans cette liste
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          Ajoutez vos prochaines actions avec une date limite pour suivre
          facilement votre progression.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence mode="popLayout">
        {items.map((tache, idx) => (
          <TacheRow
            key={tache.id}
            tache={tache}
            index={idx}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
