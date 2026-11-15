import { FolderKanban, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Projet } from "@/types/productivity";
import { ProductivityListSkeleton } from "./ProductivitySkeletons";
import { ProjetCard } from "./ProjetCard";

/** Propriétés de la liste des projets. */
export interface ProjetListProps {
  /** Projets filtrés à afficher. */
  items: Projet[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Déclenche la création d'un nouveau projet. */
  onCreate: () => void;
  /** Bascule l'état terminé d'un projet. */
  onToggleDone: (projet: Projet) => void;
  /** Ouvre la modale d'édition. */
  onEdit: (projet: Projet) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (projet: Projet) => void;
}

/**
 * Liste animée des projets avec état vide et squelette de chargement.
 */
export function ProjetList({
  items,
  isLoading,
  onCreate,
  onToggleDone,
  onEdit,
  onDelete,
}: ProjetListProps) {
  if (isLoading) {
    return <ProductivityListSkeleton count={3} />;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <FolderKanban className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          Aucun projet trouvé
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          Structurez vos objectifs dans cet espace en créant votre premier
          projet avec date de début et échéance.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map((projet, idx) => (
          <ProjetCard
            key={projet.id}
            projet={projet}
            index={idx}
            onToggleDone={onToggleDone}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
