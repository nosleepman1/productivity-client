import {
  ArrowDownUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StatutSuivi } from "@/types/finances";

/** Options de tri disponibles selon l'onglet actif. */
export type FinanceSortField = "date" | "montant" | "datePromise" | "createdAt";

/** Propriétés de la barre de filtres et pagination Finances. */
export interface FinanceFiltersBarProps {
  /** Date de début (AAAA-MM-JJ). */
  du: string;
  /** Date de fin (AAAA-MM-JJ). */
  au: string;
  /** Champ de tri actif. */
  tri: FinanceSortField;
  /** Sens du tri actif. */
  ordre: "asc" | "desc";
  /** Affiche les pilules de statut (pour Dettes / Créances). */
  showStatutFilter?: boolean;
  /** Statut sélectionné (ou vide pour tous). */
  statut?: StatutSuivi | "";
  /** Page courante (base 1). */
  page: number;
  /** Nombre total de pages. */
  totalPages: number;
  /** Nombre total d'éléments correspondants. */
  totalItems: number;
  /** Callbacks de mise à jour des filtres. */
  onDuChange: (value: string) => void;
  onAuChange: (value: string) => void;
  onTriChange: (value: FinanceSortField) => void;
  onToggleOrdre: () => void;
  onStatutChange?: (value: StatutSuivi | "") => void;
  onPageChange: (nextPage: number) => void;
  onReset: () => void;
}

const STATUT_OPTIONS: { value: StatutSuivi | ""; labelKey: string }[] = [
  { value: "", labelKey: "common.all" },
  { value: "EN_COURS", labelKey: "common.inProgress" },
  { value: "EN_RETARD", labelKey: "common.overdue" },
  { value: "SOLDEE", labelKey: "common.settled" },
];

/**
 * Barre de filtrage, tri et pagination adaptée mobile & desktop pour les listes financières.
 */
export function FinanceFiltersBar({
  du,
  au,
  tri,
  ordre,
  showStatutFilter = false,
  statut = "",
  page,
  totalPages,
  totalItems,
  onDuChange,
  onAuChange,
  onTriChange,
  onToggleOrdre,
  onStatutChange,
  onPageChange,
  onReset,
}: FinanceFiltersBarProps) {
  const { t } = useTranslation();
  const hasFilters = Boolean(du || au || statut);

  return (
    <div className="apple-surface space-y-3 rounded-2xl p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Bornes de dates */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <label
              htmlFor="finance-filter-du"
              className="text-xs text-[var(--text-secondary)]"
            >
              {t("common.from")}
            </label>
            <input
              id="finance-filter-du"
              type="date"
              value={du}
              onChange={(e) => onDuChange(e.target.value)}
              className="min-h-[32px] bg-transparent text-xs font-medium text-[var(--text-primary)] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <label
              htmlFor="finance-filter-au"
              className="text-xs text-[var(--text-secondary)]"
            >
              {t("common.to")}
            </label>
            <input
              id="finance-filter-au"
              type="date"
              value={au}
              onChange={(e) => onAuChange(e.target.value)}
              className="min-h-[32px] bg-transparent text-xs font-medium text-[var(--text-primary)] outline-none"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="apple-press inline-flex min-h-[36px] items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("common.reset")}
            </button>
          )}
        </div>

        {/* Tri */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t("common.sortBy")}
            value={tri}
            onChange={(e) => onTriChange(e.target.value as FinanceSortField)}
            className="min-h-[38px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none"
          >
            <option value="date">{t("common.date")}</option>
            <option value="montant">{t("common.amount")}</option>
            {showStatutFilter ? (
              <option value="datePromise">{t("common.promisedDue")}</option>
            ) : (
              <option value="createdAt">{t("common.recentAdded")}</option>
            )}
          </select>

          <button
            type="button"
            onClick={onToggleOrdre}
            className="apple-press inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            {ordre === "desc" ? t("common.desc") : t("common.asc")}
          </button>
        </div>
      </div>

      {/* Pilules de statut pour dettes & créances */}
      {showStatutFilter && onStatutChange && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2.5">
          {STATUT_OPTIONS.map((opt) => {
            const active = statut === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => onStatutChange(opt.value)}
                className={`apple-press min-h-[34px] rounded-full px-3 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs text-[var(--text-secondary)]">
          <span className="tabular-nums">
            {t("common.pageOf", { page, total: totalPages, count: totalItems })}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label={t("common.previousPage")}
              className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label={t("common.nextPage")}
              className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
