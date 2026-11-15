import { useState, type FormEvent } from "react";
import { UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useContacts,
  useCreateContactMutation,
} from "@/features/contacts/hooks/useContacts";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  contactFormSchema,
  toCreateContactDto,
} from "@/features/contacts/schemas/contact.schema";
import {
  suiviFormSchema,
  toSuiviDto,
} from "@/features/finances/schemas/suivi.schema";
import { toDateInputValue } from "@/features/finances/utils/format";
import type { ContactType } from "@/types/contacts";
import type {
  CreateCreanceDto,
  CreateDetteDto,
  Creance,
  Dette,
} from "@/types/finances";

/** Propriétés de la modale de création/édition de dette ou créance. */
export interface SuiviFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Type de dossier : dette ou créance. */
  kind: "dette" | "creance";
  /** Dossier existant en mode édition, sinon `null`. */
  initialData: Dette | Creance | null;
  /** Indique si la soumission est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateDetteDto & CreateCreanceDto) => void;
}

interface InnerProps {
  kind: "dette" | "creance";
  initialData: Dette | Creance | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateDetteDto & CreateCreanceDto) => void;
}

function SuiviInnerForm({
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: InnerProps) {
  const isEditing = Boolean(initialData);
  const { data: contactsPage } = useContacts({ limit: 100, tri: "nom" });
  const createContact = useCreateContactMutation();

  const [montant, setMontant] = useState(
    initialData ? String(initialData.montant) : "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [date, setDate] = useState(
    initialData
      ? toDateInputValue(initialData.date)
      : toDateInputValue(new Date().toISOString()),
  );
  const [datePromise, setDatePromise] = useState(
    initialData?.datePromise ? toDateInputValue(initialData.datePromise) : "",
  );
  const [contactId, setContactId] = useState(initialData?.contactId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mini-formulaire inline de création rapide d'un contact
  const [showNewContact, setShowNewContact] = useState(false);
  const [newNom, setNewNom] = useState("");
  const [newTelephone, setNewTelephone] = useState("");
  const [newType, setNewType] = useState<ContactType>(
    kind === "creance" ? "CLIENT" : "FOURNISSEUR",
  );
  const [contactError, setContactError] = useState<string | null>(null);

  const contacts = contactsPage?.data ?? [];

  const handleQuickCreateContact = async () => {
    const parsed = contactFormSchema.safeParse({
      nom: newNom,
      telephone: newTelephone,
      type: newType,
    });

    if (!parsed.success) {
      setContactError(
        parsed.error.issues[0]?.message ?? "Contact invalide",
      );
      return;
    }

    setContactError(null);
    const created = await createContact.mutateAsync(
      toCreateContactDto(parsed.data),
    );
    setContactId(created.id);
    setNewNom("");
    setNewTelephone("");
    setShowNewContact(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedNumber = Number(montant);
    const result = suiviFormSchema.safeParse({
      montant: montant.trim() === "" ? NaN : parsedNumber,
      description,
      date,
      datePromise,
      contactId,
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
    onSubmit(toSuiviDto(result.data, isEditing));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="suivi-montant"
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Montant total (FCFA)
          </label>
          <input
            id="suivi-montant"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="Ex : 150000"
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
            htmlFor="suivi-date"
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Date d'origine
          </label>
          <input
            id="suivi-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="suivi-description"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Description
        </label>
        <input
          id="suivi-description"
          type="text"
          maxLength={255}
          placeholder={
            kind === "dette"
              ? "Ex : Avance fournisseur, prêt matériel..."
              : "Ex : Facture client en attente, prêt accordé..."
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
          htmlFor="suivi-date-promise"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Échéance promise (optionnelle)
        </label>
        <input
          id="suivi-date-promise"
          type="date"
          value={datePromise}
          onChange={(e) => setDatePromise(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        {errors.datePromise && (
          <p className="mt-1 text-xs text-rose-500">{errors.datePromise}</p>
        )}
      </div>

      {/* Contact associé + création rapide */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="suivi-contact"
            className="text-xs font-medium text-[var(--text-secondary)]"
          >
            Contact associé (optionnel)
          </label>
          <button
            type="button"
            onClick={() => setShowNewContact((v) => !v)}
            className="apple-press inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {showNewContact ? "Fermer" : "Nouveau contact"}
          </button>
        </div>

        <select
          id="suivi-contact"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        >
          <option value="">Aucun contact associé</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
              {c.telephone ? ` (${c.telephone})` : ""}
            </option>
          ))}
        </select>

        <AnimatePresence>
          {showNewContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2.5 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3"
            >
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Création rapide de contact
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] outline-none"
                />
                <input
                  type="tel"
                  placeholder="Téléphone WhatsApp (ex: +225...)"
                  value={newTelephone}
                  onChange={(e) => setNewTelephone(e.target.value)}
                  className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <select
                  aria-label="Type de contact"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ContactType)}
                  className="min-h-[38px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 text-xs text-[var(--text-primary)] outline-none"
                >
                  {CONTACT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {CONTACT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={createContact.isPending}
                  onClick={() => void handleQuickCreateContact()}
                  className="apple-press min-h-[38px] rounded-xl bg-[var(--accent)] px-3.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {createContact.isPending ? "Création..." : "Créer & sélectionner"}
                </button>
              </div>
              {contactError && (
                <p className="mt-1.5 text-xs text-rose-500">{contactError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
              : kind === "dette"
                ? "Créer la dette"
                : "Créer la créance"}
        </button>
      </div>
    </form>
  );
}

/**
 * Modale Apple-style pour créer ou modifier une dette ou une créance,
 * incluant la création rapide d'un contact associé.
 */
export function SuiviFormModal({
  open,
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: SuiviFormModalProps) {
  const isEditing = Boolean(initialData);
  const isDette = kind === "dette";

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suivi-modal-title"
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
                id="suivi-modal-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                {isEditing
                  ? isDette
                    ? "Modifier la dette"
                    : "Modifier la créance"
                  : isDette
                    ? "Nouvelle dette"
                    : "Nouvelle créance"}
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

            <SuiviInnerForm
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
