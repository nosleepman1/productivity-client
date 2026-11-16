import { useState, type FormEvent } from "react";
import { BellRing, CalendarPlus, CheckCircle2, FolderKanban } from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import { toDateInputValue } from "@/features/finances/utils/format";
import {
  projetFormSchema,
  toCreateProjetDto,
} from "@/features/productivity/schemas/projet.schema";
import { cn } from "@/lib/utils";
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
  const [rappelActif, setRappelActif] = useState(
    initialData?.rappelActif ?? false,
  );
  const [syncCalendrier, setSyncCalendrier] = useState(
    initialData?.syncCalendrier ?? false,
  );
  const [estTermine, setEstTermine] = useState(
    initialData?.estTermine ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalTaches = initialData?.taches?.length ?? 0;
  const tachesTerminees =
    initialData?.taches?.filter((t) => t.estTerminee).length ?? 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = projetFormSchema.safeParse({
      titre,
      description,
      dateDebut,
      dateFin,
      rappelActif,
      syncCalendrier,
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
    onSubmit(toCreateProjetDto(result.data, isEditing));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        htmlFor="projet-titre"
        label="Titre du projet"
        required
        error={errors.titre}
      >
        <input
          id="projet-titre"
          type="text"
          maxLength={150}
          placeholder="Ex : Refonte application mobile"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className={cn(FORM_INPUT_CLASS, "font-medium")}
        />
      </FormField>

      <FormField
        htmlFor="projet-description"
        label="Description"
        hint="Optionnelle"
        error={errors.description}
      >
        <textarea
          id="projet-description"
          rows={3}
          maxLength={2000}
          placeholder="Objectifs clés, livrables, contexte..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={FORM_TEXTAREA_CLASS}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          htmlFor="projet-debut"
          label="Date de début"
          required
          error={errors.dateDebut}
        >
          <input
            id="projet-debut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>

        <FormField
          htmlFor="projet-fin"
          label="Échéance prévue"
          hint="Optionnelle"
          error={errors.dateFin}
        >
          <input
            id="projet-fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRappelActif((v) => !v)}
          aria-pressed={rappelActif}
          className={cn(
            "apple-press flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
            rappelActif
              ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
          )}
        >
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold">Rappels d'échéance</p>
            <p className="text-[10px] opacity-80 truncate">
              Alertes avant la date de fin
            </p>
          </div>
          <BellRing className="h-4 w-4 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setSyncCalendrier((v) => !v)}
          aria-pressed={syncCalendrier}
          className={cn(
            "apple-press flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
            syncCalendrier
              ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
          )}
        >
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold">Planifier dans l'agenda</p>
            <p className="text-[10px] opacity-80 truncate">
              Sync Google / Apple Calendar
            </p>
          </div>
          <CalendarPlus className="h-4 w-4 shrink-0" />
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          setEstTermine((v) => {
            const next = !v;
            if (next) setRappelActif(false);
            return next;
          })
        }
        aria-pressed={estTermine}
        className={cn(
          "apple-press flex min-h-[48px] w-full items-center justify-between rounded-2xl border px-4 text-left transition-colors",
          estTermine
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
        )}
      >
        <div>
          <span className="text-sm font-medium">Marquer comme terminé</span>
          {isEditing && totalTaches > 0 && (
            <p className="text-[11px] opacity-80">
              {tachesTerminees}/{totalTaches} tâche(s) terminée(s)
            </p>
          )}
        </div>
        <CheckCircle2
          className={cn(
            "h-5 w-5 transition-opacity",
            estTermine ? "opacity-100" : "opacity-30",
          )}
        />
      </button>

      <FormActions
        submitLabel={isEditing ? "Enregistrer" : "Créer le projet"}
        isPending={isPending}
        accent="indigo"
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou modifier un projet avec validation Zod.
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
    <FormSheet
      open={open}
      titleId="projet-modal-title"
      title={isEditing ? "Modifier le projet" : "Nouveau projet"}
      subtitle="Planifiez vos jalons et suivez votre avancement"
      icon={<FolderKanban className="h-5 w-5" />}
      accent="indigo"
      size="lg"
      isPending={isPending}
      onClose={onClose}
    >
      <ProjetInnerForm
        key={initialData?.id ?? "new-projet"}
        initialData={initialData}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
