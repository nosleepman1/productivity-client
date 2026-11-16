import { useState, type FormEvent } from "react";
import { Gauge, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  CATEGORIES_DEPENSES,
  useDeleteBudgetMutation,
  useUpsertBudgetMutation,
  type BudgetEnrichi,
} from "@/features/finances/hooks/useFinancesResume";
import { formatFcfa } from "@/features/finances/utils/format";
import { cn } from "@/lib/utils";

export interface CategoryBudgetsCardProps {
  espaceId: string | null;
  budgets: BudgetEnrichi[];
}

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES_DEPENSES.map((c) => [c.id, c.label]),
);

/**
 * Panneau de gestion des plafonds mensuels par catégorie de dépense.
 * Alimente directement les alertes budgétaires en temps réel (80 % et 100 %).
 */
export function CategoryBudgetsCard({
  espaceId,
  budgets,
}: CategoryBudgetsCardProps) {
  const { t } = useTranslation();
  const upsertBudget = useUpsertBudgetMutation(espaceId);
  const deleteBudget = useDeleteBudgetMutation(espaceId);

  const [isAdding, setIsAdding] = useState(false);
  const [categorie, setCategorie] = useState<string>(CATEGORIES_DEPENSES[0].id);
  const [plafond, setPlafond] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const montant = Math.trunc(Number(plafond));
    if (!Number.isFinite(montant) || montant <= 0) {
      setError(t("finances.budgets.invalidLimit"));
      return;
    }
    setError(null);
    try {
      await upsertBudget.mutateAsync({ categorie, montantPlafond: montant });
      setPlafond("");
      setIsAdding(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer ce budget.",
      );
    }
  };

  return (
    <section className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {t("finances.budgets.title")}
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
              {t("finances.budgets.subtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!espaceId}
          onClick={() => setIsAdding((v) => !v)}
          className="apple-press inline-flex shrink-0 items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {isAdding ? t("finances.budgets.close") : t("finances.budgets.define")}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-3 grid grid-cols-1 gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-12"
        >
          <div className="sm:col-span-5">
            <label className="mb-1 block text-[11px] font-medium text-[var(--muted-foreground)]">
              Catégorie
            </label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs text-[var(--foreground)]"
            >
              {CATEGORIES_DEPENSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="mb-1 block text-[11px] font-medium text-[var(--muted-foreground)]">
              Plafond mensuel (FCFA)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={100}
              placeholder="50 000"
              value={plafond}
              onChange={(e) => setPlafond(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs font-semibold tabular-nums text-[var(--foreground)]"
            />
          </div>

          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              disabled={upsertBudget.isPending}
              className="apple-press h-9 w-full rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {upsertBudget.isPending ? "..." : "Enregistrer"}
            </button>
          </div>

          {error && (
            <p className="sm:col-span-12 text-xs text-rose-500">{error}</p>
          )}
        </form>
      )}

      {budgets.length === 0 ? (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {t("finances.budgets.empty")}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {budgets.map((b) => {
            const pct = Math.min(100, Math.max(0, b.pourcentage));
            const isOver = b.pourcentage >= 100;
            const isWarning = !isOver && b.pourcentage >= 80;
            return (
              <div
                key={b.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                    {t(`finances.categories.${b.categorie}`, {
                      defaultValue:
                        CATEGORY_LABELS[b.categorie] ?? b.categorie,
                    })}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[11px] font-bold tabular-nums",
                        isOver
                          ? "text-rose-600 dark:text-rose-400"
                          : isWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {b.pourcentage} %
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteBudget.mutate(b.categorie)}
                      aria-label={`Supprimer le budget ${b.categorie}`}
                      className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOver
                        ? "bg-rose-500"
                        : isWarning
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)] tabular-nums">
                  {formatFcfa(b.depenseMois)} / {formatFcfa(b.montantPlafond)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
