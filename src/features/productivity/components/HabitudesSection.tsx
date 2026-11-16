import { useState } from "react";
import { Check, Flame, Plus, Trash2, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import {
  useCreateHabitudeMutation,
  useDeleteHabitudeMutation,
  useHabitudes,
  useToggleHabitudeMutation,
  type CreateHabitudeDto,
  type Habitude,
} from "@/features/productivity/hooks/useHabitudes";

const MOMENTS_LABELS: Record<string, string> = {
  MATIN: "Matin",
  APRES_MIDI: "Après-midi",
  SOIR: "Soir",
  TOUTE_JOURNEE: "Toute la journée",
};

const FREQUENCES_LABELS: Record<string, string> = {
  QUOTIDIEN: "Tous les jours",
  JOURS_OUVRES: "Lun – Ven",
  HEBDOMADAIRE: "Hebdomadaire",
};

export function HabitudesSection({ espaceId }: { espaceId: string | null }) {
  const { t } = useTranslation();
  const { data: habitudes = [], isLoading } = useHabitudes(espaceId);
  const createHabitude = useCreateHabitudeMutation(espaceId);
  const toggleHabitude = useToggleHabitudeMutation(espaceId);
  const deleteHabitude = useDeleteHabitudeMutation(espaceId);

  const [isAdding, setIsAdding] = useState(false);
  const [titre, setTitre] = useState("");
  const [frequence, setFrequence] =
    useState<CreateHabitudeDto["frequence"]>("QUOTIDIEN");
  const [momentJournee, setMomentJournee] =
    useState<CreateHabitudeDto["momentJournee"]>("TOUTE_JOURNEE");
  const [deleteTarget, setDeleteTarget] = useState<Habitude | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = titre.trim();
    if (!cleaned || cleaned.length > 120 || !espaceId) return;
    createHabitude.mutate(
      {
        titre: cleaned,
        frequence,
        momentJournee,
      },
      {
        onSuccess: () => {
          setTitre("");
          setIsAdding(false);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("projets.habits.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("projets.habits.subtitle")}
          </p>
        </div>
        <button
          type="button"
          disabled={!espaceId}
          onClick={() => setIsAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {t("projets.habits.newHabit")}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Nom de l'habitude
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Ex : Faire le point sur vos dépenses, Lire 20 min, Sport..."
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Fréquence
              </label>
              <select
                value={frequence}
                onChange={(e) =>
                  setFrequence(
                    e.target.value as CreateHabitudeDto["frequence"],
                  )
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
              >
                <option value="QUOTIDIEN">Tous les jours</option>
                <option value="JOURS_OUVRES">Jours ouvrés (Lun-Ven)</option>
                <option value="HEBDOMADAIRE">Hebdomadaire</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Moment de la journée
              </label>
              <select
                value={momentJournee}
                onChange={(e) =>
                  setMomentJournee(
                    e.target.value as CreateHabitudeDto["momentJournee"],
                  )
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
              >
                <option value="MATIN">Matin</option>
                <option value="APRES_MIDI">Après-midi</option>
                <option value="SOIR">Soir</option>
                <option value="TOUTE_JOURNEE">Toute la journée</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createHabitude.isPending}
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              {createHabitude.isPending ? "Ajout..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Chargement des habitudes...
        </p>
      ) : habitudes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
          <Flame className="mx-auto mb-2 h-7 w-7 text-orange-500/70" />
          <p className="text-sm font-semibold text-foreground">
            {t("projets.habits.emptyTitle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("projets.habits.emptySubtitle")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {habitudes.map((h) => (
            <div
              key={h.id}
              className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                h.completeeAujourdhui
                  ? "border-emerald-500/35 bg-emerald-500/8"
                  : "border-border/80 bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleHabitude.mutate({ id: h.id })}
                className="flex flex-1 items-center gap-3 text-left min-w-0"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    h.completeeAujourdhui
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-background text-muted-foreground hover:border-primary"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      h.completeeAujourdhui
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {h.titre}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{MOMENTS_LABELS[h.momentJournee] ?? h.momentJournee}</span>
                    <span>·</span>
                    <span>{FREQUENCES_LABELS[h.frequence] ?? h.frequence}</span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2 pl-2">
                <div
                  title={`Record : ${h.meilleureSerie} j`}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500/12 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>{h.serieActuelle} j</span>
                </div>
                {h.meilleureSerie > 0 && (
                  <span
                    title="Meilleure série"
                    className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
                  >
                    <Trophy className="h-3 w-3 text-amber-500" />
                    {h.meilleureSerie}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(h)}
                  aria-label="Supprimer l'habitude"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cette habitude ?"
        description={
          deleteTarget
            ? `L'habitude « ${deleteTarget.titre} » et son historique de série seront supprimés.`
            : ""
        }
        isPending={deleteHabitude.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteHabitude.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
