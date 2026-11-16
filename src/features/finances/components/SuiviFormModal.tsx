import { useState, type FormEvent } from "react";
import { HandCoins, Receipt, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  FORM_INPUT_CLASS,
  FORM_SELECT_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
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
import { cn } from "@/lib/utils";
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

    if (initialData && result.data.montant < initialData.montantPaye) {
      setErrors({
        montant: `Le montant total ne peut pas être inférieur au montant déjà réglé (${initialData.montantPaye.toLocaleString("fr-FR")} FCFA)`,
      });
      return;
    }

    setErrors({});
    onSubmit(toSuiviDto(result.data, isEditing));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          htmlFor="suivi-montant"
          label="Montant total"
          hint="FCFA"
          required
          error={errors.montant}
        >
          <div className="relative">
            <input
              id="suivi-montant"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="150 000"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className={cn(
                FORM_INPUT_CLASS,
                "pr-16 font-bold tabular-nums",
              )}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold tracking-wider text-[var(--muted-foreground)]">
              FCFA
            </span>
          </div>
        </FormField>

        <FormField
          htmlFor="suivi-date"
          label="Date d'origine"
          required
          error={errors.date}
        >
          <input
            id="suivi-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>
      </div>

      <FormField
        htmlFor="suivi-description"
        label="Description"
        required
        error={errors.description}
      >
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
          className={FORM_INPUT_CLASS}
        />
      </FormField>

      <FormField
        htmlFor="suivi-date-promise"
        label="Échéance promise"
        hint="Optionnelle"
        error={errors.datePromise}
      >
        <input
          id="suivi-date-promise"
          type="date"
          value={datePromise}
          onChange={(e) => setDatePromise(e.target.value)}
          className={cn(FORM_INPUT_CLASS, "tabular-nums")}
        />
      </FormField>

      {/* Contact associé + création rapide */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="suivi-contact"
            className="text-[13px] font-semibold text-[var(--foreground)]/85"
          >
            Contact associé (optionnel)
          </label>
          <button
            type="button"
            onClick={() => setShowNewContact((v) => !v)}
            className="apple-press inline-flex min-h-[32px] items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {showNewContact ? "Fermer" : "Nouveau contact"}
          </button>
        </div>

        <select
          id="suivi-contact"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          className={FORM_SELECT_CLASS}
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
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 p-3.5"
            >
              <p className="text-xs font-semibold text-[var(--foreground)]">
                Création rapide de contact
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  className={FORM_INPUT_CLASS}
                />
                <input
                  type="tel"
                  placeholder="Téléphone WhatsApp"
                  value={newTelephone}
                  onChange={(e) => setNewTelephone(e.target.value)}
                  className={FORM_INPUT_CLASS}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <select
                  aria-label="Type de contact"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ContactType)}
                  className={cn(FORM_SELECT_CLASS, "w-auto flex-1")}
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
                  className="apple-press min-h-[48px] rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {createContact.isPending ? "Création..." : "Créer & sélectionner"}
                </button>
              </div>
              {contactError && (
                <p className="mt-2 text-xs font-medium text-rose-500">
                  {contactError}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FormActions
        submitLabel={
          isEditing
            ? "Mettre à jour"
            : kind === "dette"
              ? "Créer la dette"
              : "Créer la créance"
        }
        isPending={isPending}
        accent={kind === "dette" ? "amber" : "indigo"}
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou modifier une dette ou une créance,
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
    <FormSheet
      open={open}
      titleId="suivi-modal-title"
      title={
        isEditing
          ? isDette
            ? "Modifier la dette"
            : "Modifier la créance"
          : isDette
            ? "Nouvelle dette"
            : "Nouvelle créance"
      }
      subtitle={
        isDette
          ? "Suivez un engagement à rembourser et son échéance"
          : "Suivez un montant à encaisser et ses relances"
      }
      icon={
        isDette ? (
          <Receipt className="h-5 w-5" />
        ) : (
          <HandCoins className="h-5 w-5" />
        )
      }
      accent={isDette ? "amber" : "indigo"}
      size="lg"
      isPending={isPending}
      onClose={onClose}
    >
      <SuiviInnerForm
        key={initialData?.id ?? `new-${kind}`}
        kind={kind}
        initialData={initialData}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
