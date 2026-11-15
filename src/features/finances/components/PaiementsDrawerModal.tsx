import { useState, type FormEvent } from "react";
import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  buildPaiementFormSchema,
  toCreatePaiementDto,
} from "@/features/finances/schemas/paiement.schema";
import {
  formatDateUtc,
  formatFcfa,
  toDateInputValue,
} from "@/features/finances/utils/format";
import type {
  CreatePaiementDto,
  Creance,
  Dette,
  Paiement,
} from "@/types/finances";

/** Propriétés de la modale/tiroir d'historique et d'ajout de paiements. */
export interface PaiementsDrawerModalProps {
  /** Contrôle l'ouverture du tiroir. */
  open: boolean;
  /** Nature du dossier : dette ou créance. */
  kind: "dette" | "creance";
  /** Dossier détaillé (incluant `paiements` si chargé). */
  item: Dette | Creance | null;
  /** Indique si le détail ou une mutation est en cours. */
  isLoadingDetail?: boolean;
  isSubmitting?: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Enregistre un nouveau paiement. */
  onAddPaiement: (dto: CreatePaiementDto) => Promise<void> | void;
  /** Annule un paiement existant. */
  onRemovePaiement: (paiement: Paiement) => void;
}

function PaiementQuickForm({
  reste,
  isSubmitting,
  onSubmit,
}: {
  reste: number;
  isSubmitting: boolean;
  onSubmit: (dto: CreatePaiementDto) => Promise<void> | void;
}) {
  const [montant, setMontant] = useState(String(reste));
  const [date, setDate] = useState(toDateInputValue(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const schema = buildPaiementFormSchema(reste);
    const result = schema.safeParse({
      montant: montant.trim() === "" ? NaN : Number(montant),
      date,
      note,
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
    await onSubmit(toCreatePaiementDto(result.data));
    setNote("");
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Enregistrer un règlement
        </p>
        <button
          type="button"
          onClick={() => setMontant(String(reste))}
          className="text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          Solder ({formatFcfa(reste)})
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={reste}
            step={1}
            placeholder="Montant FCFA"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="min-h-[42px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm font-semibold tabular-nums text-[var(--text-primary)] outline-none"
          />
          {errors.montant && (
            <p className="mt-1 text-xs text-rose-500">{errors.montant}</p>
          )}
        </div>

        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[42px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none"
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
          )}
        </div>
      </div>

      <input
        type="text"
        maxLength={500}
        placeholder="Note optionnelle (ex : virement, Wave, espèces...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2.5 min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] outline-none"
      />
      {errors.note && (
        <p className="mt-1 text-xs text-rose-500">{errors.note}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="apple-press mt-3 inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {isSubmitting ? "Enregistrement..." : "Valider le paiement"}
      </button>
    </form>
  );
}

/**
 * Modale Apple-style affichant l'historique des paiements d'une dette ou créance
 * et permettant d'en ajouter ou d'en annuler avec validation Zod dynamique.
 */
export function PaiementsDrawerModal({
  open,
  kind,
  item,
  isLoadingDetail = false,
  isSubmitting = false,
  onClose,
  onAddPaiement,
  onRemovePaiement,
}: PaiementsDrawerModalProps) {
  const paiements = item?.paiements ?? [];
  const isSoldee = item?.statut === "SOLDEE" || (item?.reste ?? 0) <= 0;

  return (
    <AnimatePresence>
      {open && item && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paiements-modal-title"
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
            className="apple-surface relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  {kind === "dette" ? "Remboursements" : "Encaissements"}
                </p>
                <h2
                  id="paiements-modal-title"
                  className="mt-0.5 truncate text-lg font-semibold text-[var(--text-primary)]"
                >
                  {item.description}
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

            {/* Résumé chiffré */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--bg-subtle)] p-3 text-center">
              <div>
                <p className="text-[11px] text-[var(--text-secondary)]">Total</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatFcfa(item.montant)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-secondary)]">Payé</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatFcfa(item.montantPaye)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-secondary)]">Reste</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatFcfa(item.reste)}
                </p>
              </div>
            </div>

            {/* Formulaire d'ajout ou badge soldé */}
            <div className="mt-4">
              {isSoldee ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/12 p-3.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Dossier intégralement soldé
                </div>
              ) : (
                <PaiementQuickForm
                  key={`${item.id}-${item.reste}`}
                  reste={item.reste}
                  isSubmitting={isSubmitting}
                  onSubmit={onAddPaiement}
                />
              )}
            </div>

            {/* Historique */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Historique ({paiements.length})
              </h3>

              {isLoadingDetail ? (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Chargement de l'historique...
                </p>
              ) : paiements.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Aucun paiement enregistré pour l'instant.
                </p>
              ) : (
                <ul className="mt-2.5 space-y-2">
                  {paiements.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                          {formatFcfa(p.montant)}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {formatDateUtc(p.date)}
                          {p.note ? ` · ${p.note}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemovePaiement(p)}
                        aria-label="Annuler ce paiement"
                        className="apple-press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
