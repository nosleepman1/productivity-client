import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import {
  noteFormSchema,
  toCreateNoteDto,
} from "@/features/productivity/schemas/note.schema";
import { cn } from "@/lib/utils";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        htmlFor="note-titre"
        label="Titre de la note"
        required
        error={errors.titre}
      >
        <input
          id="note-titre"
          type="text"
          maxLength={150}
          placeholder="Ex : Idée fonctionnalité, notes réunion..."
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className={cn(FORM_INPUT_CLASS, "font-medium")}
        />
      </FormField>

      <FormField
        htmlFor="note-contenu"
        label="Contenu"
        required
        error={errors.contenu}
      >
        <textarea
          id="note-contenu"
          rows={6}
          maxLength={10000}
          placeholder="Rédigez librement votre note ou idée..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className={FORM_TEXTAREA_CLASS}
        />
      </FormField>

      <FormActions
        submitLabel={isEditing ? "Enregistrer" : "Créer la note"}
        isPending={isPending}
        accent="amber"
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou éditer une note avec validation Zod.
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
    <FormSheet
      open={open}
      titleId="note-modal-title"
      title={isEditing ? "Modifier la note" : "Nouvelle note"}
      subtitle="Capturez une idée ou un compte-rendu rapidement"
      icon={<Lightbulb className="h-5 w-5" />}
      accent="amber"
      size="lg"
      isPending={isPending}
      onClose={onClose}
    >
      <NoteInnerForm
        key={initialData?.id ?? "new-note"}
        initialData={initialData}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
