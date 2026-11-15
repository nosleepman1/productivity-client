import { useState } from "react";
import { Check, Copy, Pencil, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatDateUtc } from "@/features/finances/utils/format";
import { toast } from "@/store/toast.store";
import type { Note } from "@/types/productivity";

/** Propriétés de la modale de lecture d'une note. */
export interface NoteReaderModalProps {
  /** Note actuellement ouverte, ou `null`. */
  note: Note | null;
  /** Ferme le lecteur. */
  onClose: () => void;
  /** Bascule vers le mode édition pour cette note. */
  onEdit: (note: Note) => void;
}

/**
 * Lecteur Apple Notes-style affichant le contenu complet d'une note
 * avec copie rapide dans le presse-papier et accès direct à l'édition.
 */
export function NoteReaderModal({
  note,
  onClose,
  onEdit,
}: NoteReaderModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(`${note.titre}\n\n${note.contenu}`);
      setCopied(true);
      toast.success("Note copiée dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible");
    }
  };

  return (
    <AnimatePresence>
      {note && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-reader-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="apple-surface relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">
                  Mise à jour le {formatDateUtc(note.updatedAt)}
                </p>
                <h2
                  id="note-reader-title"
                  className="mt-1 text-xl font-bold text-[var(--text-primary)]"
                >
                  {note.titre}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="apple-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 text-sm leading-relaxed whitespace-pre-line text-[var(--text-primary)]">
              {note.contenu}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="apple-press inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(note);
                }}
                className="apple-press inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
