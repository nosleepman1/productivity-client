import React, { useState } from "react";
import { Layers } from "lucide-react";
import { extractApiError } from "@/api/api";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import { useCreateEspaceMutation } from "@/features/espaces/hooks/useEspaces";
import { createEspaceSchema } from "@/features/espaces/schemas/espace.schema";
import { cn } from "@/lib/utils";
import type { EspaceType } from "@/types/espaces";

/** Propriétés de la modale de création d'un espace de travail. */
export interface EspaceFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Met à jour l'état d'ouverture. */
  onOpenChange: (open: boolean) => void;
}

const ACCENT_COLORS = [
  "#007AFF",
  "#34C759",
  "#5856D6",
  "#FF9500",
  "#0D9488",
  "#FF3B30",
];

const TYPE_OPTIONS: Array<{ value: EspaceType; label: string }> = [
  { value: "PERSONAL", label: "Personnel" },
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "OTHER", label: "Autre" },
];

/**
 * Modale mobile-first pour créer un nouvel espace de travail isolé.
 */
export const EspaceFormModal: React.FC<EspaceFormModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreateEspaceMutation();
  const [nom, setNom] = useState("");
  const [type, setType] = useState<EspaceType>("ENTREPRISE");
  const [couleur, setCouleur] = useState(ACCENT_COLORS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setNom("");
    setType("ENTREPRISE");
    setCouleur(ACCENT_COLORS[0]);
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = createEspaceSchema.safeParse({
      nom,
      type,
      couleur,
      description: description.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      handleClose();
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  return (
    <FormSheet
      open={open}
      titleId="espace-modal-title"
      title="Nouvel espace de travail"
      subtitle="Chaque espace isole ses projets, tâches, notes et finances"
      icon={<Layers className="h-5 w-5" />}
      accent="indigo"
      isPending={createMutation.isPending}
      onClose={handleClose}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormField
          htmlFor="espace-nom"
          label="Nom de l'espace"
          required
        >
          <input
            id="espace-nom"
            required
            placeholder="Ex : Studio Design, Freelance..."
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={FORM_INPUT_CLASS}
          />
        </FormField>

        <FormField label="Type d'espace">
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  "apple-press min-h-[40px] rounded-xl text-xs font-semibold transition-colors",
                  type === opt.value
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Couleur repère">
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            {ACCENT_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setCouleur(hex)}
                aria-label={`Couleur ${hex}`}
                className={cn(
                  "apple-press h-9 w-9 rounded-full transition-transform",
                  couleur === hex
                    ? "scale-110 ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--card)]"
                    : "opacity-80 hover:opacity-100",
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </FormField>

        <FormField
          htmlFor="espace-desc"
          label="Description"
          hint="Optionnelle"
        >
          <textarea
            id="espace-desc"
            rows={2}
            placeholder="Contexte ou objectif de cet espace..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(FORM_TEXTAREA_CLASS, "resize-none")}
          />
        </FormField>

        {error && (
          <p className="rounded-2xl bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        <FormActions
          submitLabel="Créer l'espace"
          pendingLabel="Création..."
          isPending={createMutation.isPending}
          accent="indigo"
          onCancel={handleClose}
        />
      </form>
    </FormSheet>
  );
};
