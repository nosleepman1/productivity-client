import { useState, type FormEvent } from "react";
import { Users } from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  contactFormSchema,
  toCreateContactDto,
} from "@/features/contacts/schemas/contact.schema";
import { cn } from "@/lib/utils";
import type { Contact, ContactType, CreateContactDto } from "@/types/contacts";

/** Propriétés de la modale de création/édition d'un contact. */
export interface ContactFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Contact existant en mode édition, sinon `null`. */
  initialData: Contact | null;
  /** Indique si la requête est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateContactDto) => void;
}

function ContactInnerForm({
  initialData,
  isPending,
  onClose,
  onSubmit,
}: Omit<ContactFormModalProps, "open">) {
  const isEditing = Boolean(initialData);
  const [nom, setNom] = useState(initialData?.nom ?? "");
  const [telephone, setTelephone] = useState(initialData?.telephone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [type, setType] = useState<ContactType>(initialData?.type ?? "CLIENT");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = contactFormSchema.safeParse({
      nom,
      telephone,
      email,
      type,
      notes,
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
    onSubmit(toCreateContactDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        htmlFor="contact-nom"
        label="Nom complet"
        required
        error={errors.nom}
      >
        <input
          id="contact-nom"
          type="text"
          maxLength={100}
          placeholder="Ex : Awa Diallo"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className={cn(FORM_INPUT_CLASS, "font-medium")}
        />
      </FormField>

      <FormField label="Catégorie" required>
        <div className="grid grid-cols-3 gap-2">
          {CONTACT_TYPES.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "apple-press min-h-[44px] rounded-2xl border px-2.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-indigo-500 bg-indigo-500/12 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {CONTACT_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          htmlFor="contact-tel"
          label="Téléphone WhatsApp"
          error={errors.telephone}
        >
          <input
            id="contact-tel"
            type="tel"
            maxLength={30}
            placeholder="+225 07 00 00 00"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className={FORM_INPUT_CLASS}
          />
        </FormField>

        <FormField
          htmlFor="contact-email"
          label="Email"
          hint="Optionnel"
          error={errors.email}
        >
          <input
            id="contact-email"
            type="email"
            maxLength={120}
            placeholder="nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FORM_INPUT_CLASS}
          />
        </FormField>
      </div>

      <FormField
        htmlFor="contact-notes"
        label="Notes"
        hint="Optionnel"
        error={errors.notes}
      >
        <textarea
          id="contact-notes"
          rows={3}
          maxLength={1000}
          placeholder="Entreprise, conditions de paiement..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={FORM_TEXTAREA_CLASS}
        />
      </FormField>

      <FormActions
        submitLabel={isEditing ? "Mettre à jour" : "Ajouter le contact"}
        isPending={isPending}
        accent="indigo"
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou modifier un contact avec validation Zod.
 */
export function ContactFormModal({
  open,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: ContactFormModalProps) {
  const isEditing = Boolean(initialData);

  return (
    <FormSheet
      open={open}
      titleId="contact-modal-title"
      title={isEditing ? "Modifier le contact" : "Nouveau contact"}
      subtitle="Associez ce contact à vos dettes, créances et relances"
      icon={<Users className="h-5 w-5" />}
      accent="indigo"
      size="lg"
      isPending={isPending}
      onClose={onClose}
    >
      <ContactInnerForm
        key={initialData?.id ?? "new-contact"}
        initialData={initialData}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
