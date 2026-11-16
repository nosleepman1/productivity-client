import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  HandCoins,
  Receipt,
  Scale,
  TrendingUp,
} from "lucide-react";
import type { FinanceTab } from "@/components/views/FinanceView";
import { formatFcfa } from "@/features/finances/utils/format";
import { cn } from "@/lib/utils";
import type { ResumeSuivi } from "@/types/finances";

/** Propriétés du bandeau de synthèse contextuel d'un sous-onglet Finances. */
export interface FinanceContextSummaryProps {
  /** Sous-onglet financier actif. */
  activeTab: FinanceTab;
  /** Cumul des revenus de la page/période (FCFA). */
  totalRevenus: number;
  /** Nombre total de revenus. */
  revenusCount: number;
  /** Cumul des dépenses de la page/période (FCFA). */
  totalDepenses: number;
  /** Nombre total de dépenses. */
  depensesCount: number;
  /** Agrégat des dettes retourné par l'API. */
  dettesResume?: ResumeSuivi;
  /** Agrégat des créances retourné par l'API. */
  creancesResume?: ResumeSuivi;
}

/**
 * Synthèse contextuelle dédiée à chaque sous-section du module Finances :
 * affiche uniquement les métriques pertinentes pour l'onglet actif (Design Thinking).
 */
export function FinanceContextSummary({
  activeTab,
  totalRevenus,
  revenusCount,
  totalDepenses,
  depensesCount,
  dettesResume,
  creancesResume,
}: FinanceContextSummaryProps) {
  if (activeTab === "contacts") {
    return null;
  }

  if (activeTab === "revenus") {
    const avg = revenusCount > 0 ? Math.round(totalRevenus / revenusCount) : 0;
    const soldeNet = totalRevenus - totalDepenses;
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Total encaissé
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 truncate text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-xl">
            {formatFcfa(totalRevenus)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)] tabular-nums">
            {revenusCount} entrée{revenusCount > 1 ? "s" : ""} affichée
            {revenusCount > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Revenu moyen
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 truncate text-lg font-extrabold tabular-nums text-[var(--foreground)] sm:text-xl">
            {formatFcfa(avg)}
          </p>
          <p className="mt-1 truncate text-[11px] text-[var(--muted-foreground)] tabular-nums">
            Solde net : {formatFcfa(soldeNet)}
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === "depenses") {
    const avg =
      depensesCount > 0 ? Math.round(totalDepenses / depensesCount) : 0;
    const ratio =
      totalRevenus > 0
        ? Math.min(100, Math.round((totalDepenses / totalRevenus) * 100))
        : 0;
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Total dépensé
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/12 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 truncate text-lg font-extrabold tabular-nums text-rose-600 dark:text-rose-400 sm:text-xl">
            {formatFcfa(totalDepenses)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)] tabular-nums">
            {depensesCount} sortie{depensesCount > 1 ? "s" : ""} · Moy.{" "}
            {formatFcfa(avg)}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Poids / Revenus
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-400">
              <Scale className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-extrabold tabular-nums text-[var(--foreground)] sm:text-xl">
            {ratio}%
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                ratio > 80 ? "bg-rose-500" : "bg-amber-500",
              )}
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const isDette = activeTab === "dettes";
  const resume = isDette ? dettesResume : creancesResume;
  const totalRestant = resume?.totalRestant ?? 0;
  const enCours = resume?.nombreEnCours ?? 0;
  const soldees = resume?.nombreSoldees ?? 0;
  const enRetard = resume?.nombreEnRetard ?? 0;
  const montantRetard = resume?.montantEnRetard ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {isDette ? "Reste à payer" : "Reste à encaisser"}
          </span>
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              isDette
                ? "bg-amber-500/12 text-amber-600 dark:text-amber-400"
                : "bg-sky-500/12 text-sky-600 dark:text-sky-400",
            )}
          >
            {isDette ? (
              <Receipt className="h-4 w-4" />
            ) : (
              <HandCoins className="h-4 w-4" />
            )}
          </span>
        </div>
        <p className="mt-2 truncate text-lg font-extrabold tabular-nums text-[var(--foreground)] sm:text-xl">
          {formatFcfa(totalRestant)}
        </p>
        <p className="mt-1 text-[11px] text-[var(--muted-foreground)] tabular-nums">
          {enCours} en cours · {soldees} soldée{soldees > 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            Échéances
          </span>
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              enRetard > 0
                ? "bg-rose-500/12 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
            )}
          >
            {enRetard > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </span>
        </div>
        <p
          className={cn(
            "mt-2 text-lg font-extrabold tabular-nums sm:text-xl",
            enRetard > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {enRetard > 0
            ? `${enRetard} en retard`
            : "À jour"}
        </p>
        <p className="mt-1 truncate text-[11px] text-[var(--muted-foreground)] tabular-nums">
          {enRetard > 0
            ? formatFcfa(montantRetard)
            : "Aucune échéance dépassée"}
        </p>
      </div>
    </div>
  );
}
