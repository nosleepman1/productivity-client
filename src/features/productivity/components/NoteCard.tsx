import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { formatDateUtc } from "@/features/finances/utils/format";
import type { Note } from "@/types/productivity";

/** Propriétés d'une carte note. */
export interface NoteCardProps {
  /** Entité note retournée par l'API. */
  note: Note;
  /** Index pour l'animation échelonnée. */
  index?: number;
  /** Ouvre le lecteur détaillé de la note. */
  onRead: (note: Note) => void;
  /** Ouvre le formulaire d'édition. */
  onEdit: (note: Note) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (note: Note) => void;
}

/**
 * Carte Apple Notes-style pour une note ou idée avec aperçu du contenu et actions rapides.
 */
export function NoteCard({
  note,
  index = 0,
  onRead,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 28,
        delay: Math.min(index * 0.04, 0.2),
      }}
      whileHover={{ y: -2 }}
      className="apple-surface flex flex-col justify-between rounded-3xl p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onRead(note)}
            className="text-left focus:outline-none"
          >
            <h3 className="line-clamp-2 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]">
              {note.titre}
            </h3>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRead(note)}
          className="mt-2 block w-full text-left focus:outline-none"
        >
          <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
            {note.contenu}
          </p>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
        <span className="text-xs text-[var(--text-secondary)]">
          Modifiée le {formatDateUtc(note.updatedAt)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRead(note)}
            aria-label={`Lire ${note.titre}`}
            className="apple-press flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label={`Modifier ${note.titre}`}
            className="apple-press flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            aria-label={`Supprimer ${note.titre}`}
            className="apple-press flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
