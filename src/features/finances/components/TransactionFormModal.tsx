import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  toTransactionDto,
  transactionFormSchema,
} from "@/features/finances/schemas/transaction.schema";
import { toDateInputValue } from "@/features/finances/utils/format";
import type {
  CreateDepenseDto,
  CreateRevenuDto,
  Depense,
  Revenu,
} from "@/types/finances";

/** Propriétés de la modale d'ajout ou édition d'un revenu ou d'une dépense. */
export interface TransactionFormModalProps {
  /** Contrôle l'affichage de la modale. */
  open: boolean;
  /** Type de transaction ciblé. */
  kind: "revenu" | "depense";
  /** Élément existant en mode édition, ou `null` en création. */
  initialData: Revenu | Depense | null;
  /** Indique si la mutation est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateRevenuDto & CreateDepenseDto) => void;
}

interface InnerFormProps {
  kind: "revenu" | "depense";
  initialData: Revenu | Depense | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateRevenuDto & CreateDepenseDto) => void;
}

function TransactionInnerForm({
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: InnerFormProps) {
  const [montant, setMontant] = useState(
    initialData ? String(initialData.montant) : "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [date, setDate] = useState(
    initialData ? toDateInputValue(initialData.date) : toDateInputValue(new Date().toISOString()),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRevenu = kind === "revenu";
  const isEditing = Boolean(initialData);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedNumber = Number(montant);
    const result = transactionFormSchema.safeParse({
      montant: montant.trim() === "" ? NaN : parsedNumber,
      description,
      date,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(toTransactionDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label
          htmlFor="tx-montant"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Montant (FCFA)
        </label>
        <input
          id="tx-montant"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="Ex : 25000"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-base font-semibold tabular-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          autoFocus
        />
        {errors.montant && (
          <p className="mt-1 text-xs text-rose-500">{errors.montant}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="tx-description"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Description
        </label>
        <input
          id="tx-description"
          type="text"
          maxLength={255}
          placeholder={
            isRevenu
              ? "Ex : Facture client, salaire, vente..."
              : "Ex : Loyer, internet, matériel..."
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="tx-date"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Date
        </label>
        <input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        {errors.date && (
          <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
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
              ? "Mettre à jour"
              : isRevenu
                ? "Ajouter le revenu"
                : "Ajouter la dépense"}
        </button>
      </div>
    </form>
  );
}

/**
 * Modale Apple-style pour créer ou modifier un revenu ou une dépense avec validation Zod.
 */
export function TransactionFormModal({
  open,
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const isRevenu = kind === "revenu";
  const isEditing = Boolean(initialData);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tx-modal-title"
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
            className="apple-surface relative z-10 w-full max-w-md rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="tx-modal-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                {isEditing
                  ? isRevenu
                    ? "Modifier le revenu"
                    : "Modifier la dépense"
                  : isRevenu
                    ? "Nouveau revenu"
                    : "Nouvelle dépense"}
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

            <TransactionInnerForm
              key={initialData?.id ?? `new-${kind}`}
              kind={kind}
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
