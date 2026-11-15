import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toDateInputValue } from "@/features/finances/utils/format";
import {
  projetFormSchema,
  toCreateProjetDto,
} from "@/features/productivity/schemas/projet.schema";
import type { CreateProjetDto, Projet } from "@/types/productivity";

/** Propriétés de la modale de création/édition de projet. */
export interface ProjetFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Projet existant en mode édition, sinon `null`. */
  initialData: Projet | null;
  /** Indique si la requête est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateProjetDto) => void;
}

function ProjetInnerForm({
  initialData,
  isPending,
  onClose,
  onSubmit,
}: Omit<ProjetFormModalProps, "open">) {
  const isEditing = Boolean(initialData);
  const [titre, setTitre] = useState(initialData?.titre ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [dateDebut, setDateDebut] = useState(
    initialData
      ? toDateInputValue(initialData.dateDebut)
      : toDateInputValue(new Date().toISOString()),
  );
  const [dateFin, setDateFin] = useState(
    initialData?.dateFin ? toDateInputValue(initialData.dateFin) : "",
  );
  const [estTermine, setEstTermine] = useState(
    initialData?.estTermine ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = projetFormSchema.safeParse({
      titre,
      description,
      dateDebut,
      dateFin,
      estTermine,
    });

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
    onSubmit(toCreateProjetDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label
          htmlFor="projet-titre"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Titre du projet
        </label>
        <input
          id="projet-titre"
          type="text"
          maxLength={150}
          placeholder="Ex : Refonte application mobile"
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
          htmlFor="projet-description"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Description
        </label>
        <textarea
          id="projet-description"
          rows={3}
          maxLength={2000}
          placeholder="Objectifs clés, livrables, contexte..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="projet-debut"
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Date de début
          </label>
          <input
            id="projet-debut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          {errors.dateDebut && (
            <p className="mt-1 text-xs text-rose-500">{errors.dateDebut}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="projet-fin"
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Date de fin (optionnelle)
          </label>
          <input
            id="projet-fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          {errors.dateFin && (
            <p className="mt-1 text-xs text-rose-500">{errors.dateFin}</p>
          )}
        </div>
      </div>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5">
        <input
          type="checkbox"
          checked={estTermine}
          onChange={(e) => setEstTermine(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Marquer comme terminé
        </span>
      </label>

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
              ? "Mettre à jour"
              : "Créer le projet"}
        </button>
      </div>
    </form>
  );
}

/**
 * Modale Apple-style pour créer ou modifier un projet avec validation Zod.
 */
export function ProjetFormModal({
  open,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: ProjetFormModalProps) {
  const isEditing = Boolean(initialData);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="projet-modal-title"
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
                id="projet-modal-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                {isEditing ? "Modifier le projet" : "Nouveau projet"}
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

            <ProjetInnerForm
              key={initialData?.id ?? "new-projet"}
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
