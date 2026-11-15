import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  noteFormSchema,
  toCreateNoteDto,
} from "@/features/productivity/schemas/note.schema";
import type { CreateNoteDto, Note } from "@/types/productivity";

/** Propriétés de la modale de création/édition d'une note. */
export interface NoteFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Note existante en mode édition, sinon `null`. */
  initialData: Note | null;
  /** Indique si la requête est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateNoteDto) => void;
}

function NoteInnerForm({
  initialData,
  isPending,
  onClose,
  onSubmit,
}: Omit<NoteFormModalProps, "open">) {
  const isEditing = Boolean(initialData);
  const [titre, setTitre] = useState(initialData?.titre ?? "");
  const [contenu, setContenu] = useState(initialData?.contenu ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = noteFormSchema.safeParse({ titre, contenu });

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    onSubmit(toCreateNoteDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label
          htmlFor="note-titre"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Titre de la note
        </label>
        <input
          id="note-titre"
          type="text"
          maxLength={150}
          placeholder="Ex : Idée fonctionnalité, notes réunion..."
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          autoFocus
        />
        {errors.titre && (
          <p className="mt-1 text-xs text-rose-500">{errors.titre}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="note-contenu"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Contenu
        </label>
        <textarea
          id="note-contenu"
          rows={7}
          maxLength={10000}
          placeholder="Rédigez librement votre note ou idée..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3.5 text-sm leading-relaxed text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        {errors.contenu && (
          <p className="mt-1 text-xs text-rose-500">{errors.contenu}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="apple-press min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="apple-press min-h-[44px] rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {isPending
            ? "Enregistrement..."
            : isEditing
              ? "Enregistrer"
              : "Créer la note"}
        </button>
      </div>
    </form>
  );
}

/**
 * Modale Apple-style pour créer ou éditer une note avec validation Zod.
 */
export function NoteFormModal({
  open,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: NoteFormModalProps) {
  const isEditing = Boolean(initialData);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={isPending ? undefined : onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="apple-surface relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="note-modal-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                {isEditing ? "Modifier la note" : "Nouvelle note"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="Fermer"
                className="apple-press flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <NoteInnerForm
              key={initialData?.id ?? "new-note"}
              initialData={initialData}
              isPending={isPending}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
