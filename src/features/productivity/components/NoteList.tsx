import { Plus, StickyNote } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Note } from "@/types/productivity";
import { NoteCard } from "./NoteCard";
import { ProductivityListSkeleton } from "./ProductivitySkeletons";

/** Propriétés de la grille de notes. */
export interface NoteListProps {
  /** Notes filtrées à afficher. */
  items: Note[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Déclenche la création d'une note. */
  onCreate: () => void;
  /** Ouvre le lecteur détaillé. */
  onRead: (note: Note) => void;
  /** Ouvre la modale d'édition. */
  onEdit: (note: Note) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (note: Note) => void;
}

/**
 * Grille responsive animée des notes et idées avec état vide et squelette de chargement.
 */
export function NoteList({
  items,
  isLoading,
  onCreate,
  onRead,
  onEdit,
  onDelete,
}: NoteListProps) {
  const { t } = useTranslation();
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
          <StickyNote className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          {t("projetsExtra.empty.noNoteTitle")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          {t("projetsExtra.empty.noNoteDesc")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t("idees.newNote")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {items.map((note, idx) => (
          <NoteCard
            key={note.id}
            note={note}
            index={idx}
            onRead={onRead}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
