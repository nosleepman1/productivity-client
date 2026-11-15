import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/** Propriétés du dialogue de confirmation de suppression. */
export interface DeleteConfirmDialogProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Titre court de l'action destructive. */
  title: string;
  /** Description contextuelle de l'élément qui sera supprimé. */
  description: string;
  /** Indique si la requête de suppression est en cours. */
  isPending?: boolean;
  /** Callback déclenché lors de l'annulation. */
  onCancel: () => void;
  /** Callback déclenché lors de la confirmation. */
  onConfirm: () => void;
}

/**
 * Modale de confirmation Apple-style pour les suppressions financières
 * (revenus, dépenses, dettes, créances ou paiements).
 */
export function DeleteConfirmDialog({
  open,
  title,
  description,
  isPending = false,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={isPending ? undefined : onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="apple-surface relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              aria-label="Fermer"
              className="apple-press absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3
              id="delete-confirm-title"
              className="mt-4 text-center text-base font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-center text-sm text-[var(--text-secondary)]">
              {description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="apple-press min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)] disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="apple-press min-h-[44px] rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
