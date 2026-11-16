import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Filtre d'état local pour projets et tâches. */
export type ProductivityStatusFilter = "all" | "active" | "done";

/** Propriétés de la barre de filtres et pagination Productivité. */
export interface ProductivityFiltersBarProps {
  /** Terme de recherche textuelle côté client. */
  search: string;
  /** Callback de mise à jour de la recherche. */
  onSearchChange: (value: string) => void;
  /** Filtre d'état optionnel (masqué pour les notes). */
  showStatusFilter?: boolean;
  statusFilter?: ProductivityStatusFilter;
  onStatusFilterChange?: (value: ProductivityStatusFilter) => void;
  /** Champ de tri actif. */
  tri: string;
  sortOptions: { value: string; label: string }[];
  onTriChange: (value: string) => void;
  /** Ordre de tri. */
  ordre: "asc" | "desc";
  onToggleOrdre: () => void;
  /** Pagination. */
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (nextPage: number) => void;
}

const STATUS_PILLS: { value: ProductivityStatusFilter; labelKey: string }[] = [
  { value: "all", labelKey: "common.all" },
  { value: "active", labelKey: "common.inProgress" },
  { value: "done", labelKey: "common.completed" },
];

/**
 * Barre de recherche, filtrage, tri et pagination pour Projets, Tâches et Notes.
 */
export function ProductivityFiltersBar({
  search,
  onSearchChange,
  showStatusFilter = false,
  statusFilter = "all",
  onStatusFilterChange,
  tri,
  sortOptions,
  onTriChange,
  ordre,
  onToggleOrdre,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ProductivityFiltersBarProps) {
  const { t } = useTranslation();
  return (
    <div className="apple-surface space-y-3 rounded-2xl p-3.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("projetsExtra.searchPlaceholder")}
            className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t("common.sortBy")}
            value={tri}
            onChange={(e) => onTriChange(e.target.value)}
            className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleOrdre}
            className="apple-press inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-primary)]"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            {ordre === "desc" ? t("common.desc") : t("common.asc")}
          </button>
        </div>
      </div>

      {showStatusFilter && onStatusFilterChange && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2.5">
          {STATUS_PILLS.map((pill) => {
            const active = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => onStatusFilterChange(pill.value)}
                className={`apple-press min-h-[34px] rounded-full px-3 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t(pill.labelKey)}
              </button>
            );
          })}
        </div>
      )}

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
