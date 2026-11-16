import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckSquare,
  FolderKanban,
  Lightbulb,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { useCreateDepenseMutation } from "@/features/finances/hooks/useDepenses";
import {
  CATEGORIES_DEPENSES,
  CATEGORIES_REVENUS,
  MOYENS_PAIEMENT,
} from "@/features/finances/hooks/useFinancesResume";
import { useCreateRevenuMutation } from "@/features/finances/hooks/useRevenus";
import {
  toTransactionDto,
  transactionFormSchema,
} from "@/features/finances/schemas/transaction.schema";
import { toDateInputValue } from "@/features/finances/utils/format";
import { useCreateNoteMutation } from "@/features/productivity/hooks/useNotes";
import {
  useCreateProjetMutation,
  useProjets,
} from "@/features/productivity/hooks/useProjets";
import { useCreateTacheMutation } from "@/features/productivity/hooks/useTaches";
import {
  noteFormSchema,
  toCreateNoteDto,
} from "@/features/productivity/schemas/note.schema";
import {
  projetFormSchema,
  toCreateProjetDto,
} from "@/features/productivity/schemas/projet.schema";
import {
  tacheFormSchema,
  toCreateTacheDto,
} from "@/features/productivity/schemas/tache.schema";
import { cn } from "@/lib/utils";

/** Propriétés de la modale d'ajout rapide central. */
export interface QuickAddModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Met à jour l'état d'ouverture de la modale. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modale mobile-first d'ajout rapide (Finance, Projet ou Note/Idée)
 * accessible depuis le bouton central `+` de la barre de navigation.
 */
export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { activeEspaceId } = useActiveEspace();
  const createRevenu = useCreateRevenuMutation(activeEspaceId);
  const createDepense = useCreateDepenseMutation(activeEspaceId);
  const createTache = useCreateTacheMutation(activeEspaceId);
  const createProjet = useCreateProjetMutation(activeEspaceId);
  const createNote = useCreateNoteMutation(activeEspaceId);
  const projetsQuery = useProjets(activeEspaceId, { page: 1, limit: 50 });
  const allProjets = projetsQuery.data?.data ?? [];

  const [activeType, setActiveType] = useState<
    "finance" | "tache" | "projet" | "idee"
  >("finance");

  // Finance form
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txCategorie, setTxCategorie] = useState("ALIMENTATION");
  const [txMoyen, setTxMoyen] = useState("WAVE");
  const [txError, setTxError] = useState<string | null>(null);

  // Task form
  const [tacheTitre, setTacheTitre] = useState("");
  const [tacheDate, setTacheDate] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [tacheHeure, setTacheHeure] = useState("");
  const [tacheProjetId, setTacheProjetId] = useState("");
  const [tacheSyncCal, setTacheSyncCal] = useState(false);
  const [tacheError, setTacheError] = useState<string | null>(null);

  // Project form
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDebut, setProjDebut] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [projError, setProjError] = useState<string | null>(null);

  // Note / Idea form
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [ideaError, setIdeaError] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const isPending =
    createRevenu.isPending ||
    createDepense.isPending ||
    createTache.isPending ||
    createProjet.isPending ||
    createNote.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeType === "finance") {
        const parsed = transactionFormSchema.safeParse({
          montant: txAmount.trim() === "" ? NaN : Number(txAmount),
          description: txTitle,
          date: toDateInputValue(new Date().toISOString()),
        });

        if (!parsed.success) {
          setTxError(parsed.error.issues[0]?.message ?? "Données invalides");
          return;
        }

        setTxError(null);
        const dto = {
          ...toTransactionDto(parsed.data),
          categorie: txCategorie,
          moyenPaiement: txMoyen,
        };
        if (txType === "income") {
          await createRevenu.mutateAsync(dto);
        } else {
          await createDepense.mutateAsync(dto);
        }
        setTxTitle("");
        setTxAmount("");
      } else if (activeType === "tache") {
        const parsed = tacheFormSchema.safeParse({
          titre: tacheTitre,
          description: "",
          dateLimite: tacheDate,
          heureLimite: tacheHeure,
          priorite: "MOYENNE",
          projetId: tacheProjetId || null,
          rappelActif: true,
          syncCalendrier: tacheSyncCal,
          estTerminee: false,
        });

        if (!parsed.success) {
          setTacheError(parsed.error.issues[0]?.message ?? "Données invalides");
          return;
        }

        setTacheError(null);
        await createTache.mutateAsync(toCreateTacheDto(parsed.data));
        setTacheTitre("");
        setTacheHeure("");
      } else if (activeType === "projet") {
        const parsed = projetFormSchema.safeParse({
          titre: projTitle,
          description: projDesc,
          dateDebut: projDebut,
          estTermine: false,
        });

        if (!parsed.success) {
          setProjError(parsed.error.issues[0]?.message ?? "Données invalides");
          return;
        }

        setProjError(null);
        await createProjet.mutateAsync(toCreateProjetDto(parsed.data));
        setProjTitle("");
        setProjDesc("");
      } else if (activeType === "idee") {
        const parsed = noteFormSchema.safeParse({
          titre: ideaTitle,
          contenu: ideaDesc,
        });

        if (!parsed.success) {
          setIdeaError(parsed.error.issues[0]?.message ?? "Données invalides");
          return;
        }

        setIdeaError(null);
        await createNote.mutateAsync(toCreateNoteDto(parsed.data));
        setIdeaTitle("");
        setIdeaDesc("");
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onOpenChange(false);
      }, 550);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      if (activeType === "finance") setTxError(msg);
      else if (activeType === "tache") setTacheError(msg);
      else if (activeType === "projet") setProjError(msg);
      else setIdeaError(msg);
    }
  };

  return (
    <FormSheet
      open={open}
      titleId="quick-add-title"
      title={t("quickAdd.title")}
      subtitle={t("quickAdd.subtitle")}
      icon={<Plus className="h-5 w-5" />}
      accent={
        activeType === "finance"
          ? txType === "income"
            ? "emerald"
            : "rose"
          : activeType === "projet"
            ? "indigo"
            : "amber"
      }
      isPending={isPending}
      onClose={() => onOpenChange(false)}
    >
      {/* Sélecteur de domaine */}
      <div className="grid grid-cols-4 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5">
        <button
          type="button"
          onClick={() => setActiveType("finance")}
          className={cn(
            "apple-press flex min-h-[42px] items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-all",
            activeType === "finance"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          )}
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-500" />
          {t("quickAdd.tabFinance")}
        </button>

        <button
          type="button"
          onClick={() => setActiveType("tache")}
          className={cn(
            "apple-press flex min-h-[42px] items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-all",
            activeType === "tache"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          )}
        >
          <CheckSquare className="h-3.5 w-3.5 text-sky-500" />
          {t("quickAdd.tabTask")}
        </button>

        <button
          type="button"
          onClick={() => setActiveType("projet")}
          className={cn(
            "apple-press flex min-h-[42px] items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-all",
            activeType === "projet"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          )}
        >
          <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
          {t("quickAdd.tabProject")}
        </button>

        <button
          type="button"
          onClick={() => setActiveType("idee")}
          className={cn(
            "apple-press flex min-h-[42px] items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-all",
            activeType === "idee"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          )}
        >
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          {t("quickAdd.tabNote")}
        </button>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-4 space-y-4"
      >
        {activeType === "finance" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTxType("expense");
                  setTxCategorie("ALIMENTATION");
                }}
                className={cn(
                  "apple-press flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-all",
                  txType === "expense"
                    ? "border-rose-500/50 bg-rose-500/12 text-rose-600 dark:text-rose-400"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
                )}
              >
                <TrendingDown className="h-4 w-4" />
                {t("quickAdd.expense")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTxType("income");
                  setTxCategorie("SALAIRE");
                }}
                className={cn(
                  "apple-press flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-all",
                  txType === "income"
                    ? "border-emerald-500/50 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
                )}
              >
                <TrendingUp className="h-4 w-4" />
                {t("quickAdd.income")}
              </button>
            </div>

            <FormField
              htmlFor="qa-tx-amount"
              label={t("quickAdd.amount")}
              hint={t("common.fcfa")}
              required
            >
              <div className="relative">
                <input
                  id="qa-tx-amount"
                  required
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="25 000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className={cn(
                    FORM_INPUT_CLASS,
                    "pr-16 text-lg font-bold tabular-nums",
                  )}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold tracking-wider text-[var(--muted-foreground)]">
                  FCFA
                </span>
              </div>
            </FormField>

            <FormField
              htmlFor="qa-tx-title"
              label="Description / Libellé"
              required
              error={txError ?? undefined}
            >
              <input
                id="qa-tx-title"
                required
                placeholder="Ex : Taxi, Courses, Facture client..."
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2.5">
              <FormField htmlFor="qa-tx-cat" label="Catégorie">
                <select
                  id="qa-tx-cat"
                  value={txCategorie}
                  onChange={(e) => setTxCategorie(e.target.value)}
                  className={FORM_INPUT_CLASS}
                >
                  {(txType === "expense"
                    ? CATEGORIES_DEPENSES
                    : CATEGORIES_REVENUS
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField htmlFor="qa-tx-moyen" label="Canal / Paiement">
                <select
                  id="qa-tx-moyen"
                  value={txMoyen}
                  onChange={(e) => setTxMoyen(e.target.value)}
                  className={FORM_INPUT_CLASS}
                >
                  {MOYENS_PAIEMENT.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </>
        )}

        {activeType === "tache" && (
          <>
            <FormField
              htmlFor="qa-tache-titre"
              label="Titre de la tâche"
              required
              error={tacheError ?? undefined}
            >
              <input
                id="qa-tache-titre"
                required
                placeholder="Ex : Laver le linge à 17h, Appeler client..."
                value={tacheTitre}
                onChange={(e) => setTacheTitre(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2.5">
              <FormField htmlFor="qa-tache-date" label="Date prévue" required>
                <input
                  id="qa-tache-date"
                  type="date"
                  required
                  value={tacheDate}
                  onChange={(e) => setTacheDate(e.target.value)}
                  className={cn(FORM_INPUT_CLASS, "tabular-nums")}
                />
              </FormField>

              <FormField
                htmlFor="qa-tache-heure"
                label="Heure précise"
                hint="Optionnelle"
              >
                <input
                  id="qa-tache-heure"
                  type="time"
                  value={tacheHeure}
                  onChange={(e) => setTacheHeure(e.target.value)}
                  className={cn(FORM_INPUT_CLASS, "tabular-nums")}
                />
              </FormField>
            </div>

            <FormField
              htmlFor="qa-tache-projet"
              label="Projet associé"
              hint="Optionnel (solo par défaut)"
            >
              <select
                id="qa-tache-projet"
                value={tacheProjetId}
                onChange={(e) => setTacheProjetId(e.target.value)}
                className={FORM_INPUT_CLASS}
              >
                <option value="">Aucun (Tâche indépendante)</option>
                {allProjets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titre}
                  </option>
                ))}
              </select>
            </FormField>

            <label className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs font-medium text-[var(--foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={tacheSyncCal}
                onChange={(e) => setTacheSyncCal(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-indigo-600"
              />
              <span>Synchroniser avec mon Google / Apple Calendar</span>
            </label>
          </>
        )}

        {activeType === "projet" && (
          <>
            <FormField
              htmlFor="qa-proj-title"
              label="Titre du projet"
              required
            >
              <input
                id="qa-proj-title"
                required
                placeholder="Ex : Refonte landing page & SEO"
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </FormField>

            <FormField
              htmlFor="qa-proj-desc"
              label="Description"
              hint="Optionnelle"
            >
              <textarea
                id="qa-proj-desc"
                placeholder="Objectif et livrables clés..."
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                rows={3}
                className={FORM_TEXTAREA_CLASS}
              />
            </FormField>

            <FormField
              htmlFor="qa-proj-date"
              label="Date de début"
              required
              error={projError ?? undefined}
            >
              <input
                id="qa-proj-date"
                required
                type="date"
                value={projDebut}
                onChange={(e) => setProjDebut(e.target.value)}
                className={cn(FORM_INPUT_CLASS, "tabular-nums")}
              />
            </FormField>
          </>
        )}

        {activeType === "idee" && (
          <>
            <FormField
              htmlFor="qa-idea-title"
              label="Titre de la note / idée"
              required
            >
              <input
                id="qa-idea-title"
                required
                placeholder="Ex : Automatiser les relances"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </FormField>

            <FormField
              htmlFor="qa-idea-desc"
              label="Contenu"
              required
              error={ideaError ?? undefined}
            >
              <textarea
                id="qa-idea-desc"
                required
                placeholder="Détails, liens ou pensées clés..."
                value={ideaDesc}
                onChange={(e) => setIdeaDesc(e.target.value)}
                rows={4}
                className={FORM_TEXTAREA_CLASS}
              />
            </FormField>
          </>
        )}

        <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="apple-press inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="apple-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-500 disabled:opacity-60"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4" /> {t("quickAdd.saved")}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> {t("common.save")}
              </>
            )}
          </button>
        </div>
      </form>
    </FormSheet>
  );
};
