import { useState, type FormEvent } from "react";
import { BellRing, CalendarPlus, CheckCircle2, CheckSquare } from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import { toDateInputValue } from "@/features/finances/utils/format";
import {
  tacheFormSchema,
  toCreateTacheDto,
} from "@/features/productivity/schemas/tache.schema";
import { cn } from "@/lib/utils";
import type {
  CreateTacheDto,
  PrioriteTache,
  Projet,
  Tache,
} from "@/types/productivity";

/** Propriétés de la modale de création/édition de tâche. */
export interface TacheFormModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Tâche existante en mode édition, sinon `null`. */
  initialData: Tache | null;
  /** Liste optionnelle des projets pour rattacher la tâche (ou la laisser en solo). */
  projets?: Projet[];
  /** Indique si la requête est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateTacheDto) => void;
}

function extraireHeureLocale(iso?: string): string {
  if (!iso) return "";
  if (iso.endsWith("T00:00:00.000Z")) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function TacheInnerForm({
  initialData,
  projets = [],
  isPending,
  onClose,
  onSubmit,
}: Omit<TacheFormModalProps, "open">) {
  const isEditing = Boolean(initialData);
  const [titre, setTitre] = useState(initialData?.titre ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [dateLimite, setDateLimite] = useState(
    initialData
      ? toDateInputValue(initialData.dateLimite)
      : toDateInputValue(new Date().toISOString()),
  );
  const [heureLimite, setHeureLimite] = useState(
    initialData ? extraireHeureLocale(initialData.dateLimite) : "",
  );
  const [priorite, setPriorite] = useState<PrioriteTache>(
    initialData?.priorite ?? "MOYENNE",
  );
  const [projetId, setProjetId] = useState<string>(
    initialData?.projetId ?? "",
  );
  const [rappelActif, setRappelActif] = useState(
    initialData?.rappelActif ?? true,
  );
  const [syncCalendrier, setSyncCalendrier] = useState(
    initialData?.syncCalendrier ?? false,
  );
  const [estTerminee, setEstTerminee] = useState(
    initialData?.estTerminee ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = tacheFormSchema.safeParse({
      titre,
      description,
      dateLimite,
      heureLimite,
      priorite,
      projetId: projetId || null,
      rappelActif,
      syncCalendrier,
      estTerminee,
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
    onSubmit(toCreateTacheDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        htmlFor="tache-titre"
        label="Titre de la tâche"
        required
        error={errors.titre}
      >
        <input
          id="tache-titre"
          type="text"
          maxLength={150}
          placeholder="Ex : Laver le linge à 17h ou Finaliser la maquette"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className={cn(FORM_INPUT_CLASS, "font-medium")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          htmlFor="tache-date-limite"
          label="Jour prévu / Échéance"
          required
          error={errors.dateLimite}
        >
          <input
            id="tache-date-limite"
            type="date"
            value={dateLimite}
            onChange={(e) => setDateLimite(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>

        <FormField
          htmlFor="tache-heure-limite"
          label="Heure précise"
          hint="Optionnelle (ex: 17:00)"
          error={errors.heureLimite}
        >
          <input
            id="tache-heure-limite"
            type="time"
            value={heureLimite}
            onChange={(e) => setHeureLimite(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField htmlFor="tache-priorite" label="Priorité">
          <select
            id="tache-priorite"
            value={priorite}
            onChange={(e) => setPriorite(e.target.value as PrioriteTache)}
            className={FORM_INPUT_CLASS}
          >
            <option value="BASSE">Basse</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="HAUTE">Haute</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </FormField>

        <FormField
          htmlFor="tache-projet"
          label="Projet associé"
          hint="Optionnel (solo par défaut)"
        >
          <select
            id="tache-projet"
            value={projetId}
            onChange={(e) => setProjetId(e.target.value)}
            className={FORM_INPUT_CLASS}
          >
            <option value="">Aucun (Tâche indépendante)</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titre}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        htmlFor="tache-description"
        label="Description / Notes"
        hint="Optionnelle"
        error={errors.description}
      >
        <textarea
          id="tache-description"
          rows={2}
          maxLength={1000}
          placeholder="Détails optionnels..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={FORM_TEXTAREA_CLASS}
        />
      </FormField>

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
            <p className="text-xs font-semibold">Rappels progressifs</p>
            <p className="text-[10px] opacity-80 truncate">
              JJ, -10h, -5h, -2h, -1h, -30m, -5m
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
          setEstTerminee((v) => {
            const next = !v;
            if (next) setRappelActif(false);
            return next;
          })
        }
        aria-pressed={estTerminee}
        className={cn(
          "apple-press flex min-h-[44px] w-full items-center justify-between rounded-2xl border px-4 text-left transition-colors",
          estTerminee
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
        )}
      >
        <span className="text-xs font-medium">Tâche terminée</span>
        <CheckCircle2
          className={cn(
            "h-4 w-4 transition-opacity",
            estTerminee ? "opacity-100" : "opacity-30",
          )}
        />
      </button>

      <FormActions
        submitLabel={isEditing ? "Enregistrer" : "Créer la tâche"}
        isPending={isPending}
        accent="indigo"
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou modifier une tâche avec validation Zod.
 */
export function TacheFormModal({
  open,
  initialData,
  projets,
  isPending,
  onClose,
  onSubmit,
}: TacheFormModalProps) {
  const isEditing = Boolean(initialData);

  return (
    <FormSheet
      open={open}
      titleId="tache-modal-title"
      title={isEditing ? "Modifier la tâche" : "Nouvelle tâche"}
      subtitle="Action autonome ou rattachée à un projet, avec rappels intelligents"
      icon={<CheckSquare className="h-5 w-5" />}
      accent="indigo"
      isPending={isPending}
      onClose={onClose}
    >
      <TacheInnerForm
        key={initialData?.id ?? "new-tache"}
        initialData={initialData}
        projets={projets}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
