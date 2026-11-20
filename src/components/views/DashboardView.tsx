import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  Check,
  CheckSquare,
  Flame,
  FolderKanban,
  HandCoins,
  Quote,
  Receipt,
  RefreshCw,
  StickyNote,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { CashFlowChart } from "@/features/finances/components/CashFlowChart";
import { useCreancesResume } from "@/features/finances/hooks/useCreances";
import { useDettesResume } from "@/features/finances/hooks/useDettes";
import { useFinancesResume } from "@/features/finances/hooks/useFinancesResume";
import {
  subscriptionsApi,
  type DailyQuote,
} from "@/features/subscriptions/api/subscriptions.api";
import { useTodayQuote } from "@/features/subscriptions/hooks/useSubscriptions";
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications";
import {
  useHabitudes,
  useToggleHabitudeMutation,
} from "@/features/productivity/hooks/useHabitudes";
import { formatDateUtc, formatFcfa } from "@/features/finances/utils/format";
import { useNotes } from "@/features/productivity/hooks/useNotes";
import { useProjets } from "@/features/productivity/hooks/useProjets";
import {
  useTaches,
  useUpdateTacheMutation,
} from "@/features/productivity/hooks/useTaches";
import { getDeadlineBadge } from "@/features/productivity/utils/dates";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { FinanceTab } from "./FinanceView";
import type { ProjetsSubTab } from "./ProjetsView";

/** Propriétés du tableau de bord principal. */
export interface DashboardViewProps {
  /** Navigue vers l'univers Finances sur un sous-onglet précis. */
  onOpenFinance: (subTab?: FinanceTab) => void;
  /** Navigue vers l'univers Projets sur un sous-onglet précis. */
  onOpenProjets: (subTab?: ProjetsSubTab) => void;
}

interface RecentMovement {
  id: string;
  kind: "revenu" | "depense";
  description: string;
  montant: number;
  date: string;
}

/**
 * Tableau de bord principal Bento affiché à l'ouverture de l'application :
 * synthétise la trésorerie, les graphiques de flux, les derniers mouvements,
 * les tâches prioritaires, les projets actifs et les notes récentes.
 */
export function DashboardView({
  onOpenFinance,
  onOpenProjets,
}: DashboardViewProps) {
  const user = useAuthStore((s) => s.user);
  const { activeEspace, activeEspaceId } = useActiveEspace();

  const financesResume = useFinancesResume(activeEspaceId);
  const habitudesQuery = useHabitudes(activeEspaceId);
  const toggleHabitude = useToggleHabitudeMutation(activeEspaceId);
  const dettesResume = useDettesResume(activeEspaceId);
  const creancesResume = useCreancesResume(activeEspaceId);
  const todayQuoteQuery = useTodayQuote();
  const [customQuote, setCustomQuote] = useState<DailyQuote | null>(null);
  const [isCyclingQuote, setIsCyclingQuote] = useState(false);
  const displayedQuote = customQuote ?? todayQuoteQuery.data;

  const handleNextQuote = async () => {
    if (isCyclingQuote) return;
    setIsCyclingQuote(true);
    try {
      const next = await subscriptionsApi.getRandomQuote(displayedQuote?.id);
      if (next) setCustomQuote(next);
    } finally {
      setIsCyclingQuote(false);
    }
  };

  const projetsQuery = useProjets(activeEspaceId, {
    page: 1,
    limit: 20,
    tri: "createdAt",
    ordre: "desc",
  });
  const tachesQuery = useTaches(activeEspaceId, {
    page: 1,
    limit: 50,
    tri: "dateLimite",
    ordre: "asc",
  });
  const notesQuery = useNotes(activeEspaceId, {
    page: 1,
    limit: 4,
    tri: "updatedAt",
    ordre: "desc",
  });
  const { t } = useTranslation();
  const updateTache = useUpdateTacheMutation(activeEspaceId);

  const totalRevenus = financesResume.data?.totalRevenus ?? 0;
  const totalDepenses = financesResume.data?.totalDepenses ?? 0;
  const soldeNet =
    financesResume.data?.soldeNet ?? totalRevenus - totalDepenses;
  const totalFlux = Math.max(totalRevenus + totalDepenses, 1);
  const revenusRatio = Math.round((totalRevenus / totalFlux) * 100);

  const recentMovements = useMemo<RecentMovement[]>(() => {
    const raw = financesResume.data?.mouvementsRecents ?? [];
    return raw.slice(0, 5).map((m) => ({
      id: m.id,
      kind: m.kind,
      description: m.description,
      montant: m.montant,
      date: m.date,
    }));
  }, [financesResume.data?.mouvementsRecents]);

  const habitudesList = useMemo(
    () => habitudesQuery.data ?? [],
    [habitudesQuery.data],
  );

  const allProjets = useMemo(
    () => projetsQuery.data?.data ?? [],
    [projetsQuery.data?.data],
  );
  const allTaches = useMemo(
    () => tachesQuery.data?.data ?? [],
    [tachesQuery.data?.data],
  );
  const recentNotes = useMemo(
    () => notesQuery.data?.data ?? [],
    [notesQuery.data?.data],
  );

  const projetsActifs = useMemo(
    () => allProjets.filter((p) => !p.estTermine),
    [allProjets],
  );
  const pendingTaches = useMemo(
    () => allTaches.filter((t) => !t.estTerminee),
    [allTaches],
  );

  const tachesDoneCount = allTaches.length - pendingTaches.length;
  const tachesProgress =
    allTaches.length > 0
      ? Math.round((tachesDoneCount / allTaches.length) * 100)
      : 0;
  const projetsDoneCount = allProjets.length - projetsActifs.length;
  const projetsProgress =
    allProjets.length > 0
      ? Math.round((projetsDoneCount / allProjets.length) * 100)
      : 0;

  const creancesRestant = creancesResume.data?.totalRestant ?? 0;
  const dettesRestant = dettesResume.data?.totalRestant ?? 0;
  const creancesRetard = creancesResume.data?.nombreEnRetard ?? 0;
  const dettesRetard = dettesResume.data?.nombreEnRetard ?? 0;

  const greetingName = user?.name?.trim().split(/\s+/)[0] || "vous";
  const push = usePushNotifications();
  const showPushPrompt =
    push.isSupported &&
    push.isSecureContext &&
    push.serverConfigured &&
    !push.isSubscribed &&
    push.permission !== "denied";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5 pb-28">
        {showPushPrompt && (
          <div className="apple-surface flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/8 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  Activer les notifications
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Recevez vos rappels, citations et alertes en temps réel.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={push.isPending}
              onClick={push.enable}
              className="apple-press shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {push.isPending ? "Activation..." : "Autoriser"}
            </button>
          </div>
        )}

        {/* 1. Hero Bento Card — Trésorerie & Action rapide */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/70 to-slate-50 p-5 text-slate-900 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 dark:text-white dark:shadow-xl dark:shadow-black/30 sm:p-6"
        >
          {/* Halo décoratif discret */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/12 blur-3xl dark:bg-indigo-500/25" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {activeEspace?.nom ?? t("common.activeSpace")}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-[26px]">
              {t("dashboard.greeting", { name: greetingName })}
            </h1>
          </div>

          {/* Solde Net central */}
          <div className="relative mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-300">
                {t("dashboard.netBalanceAvailable")}
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
                {formatFcfa(soldeNet)}
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                soldeNet >= 0
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30",
              )}
            >
              {soldeNet >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {soldeNet >= 0
                ? t("dashboard.positiveCashflow")
                : t("dashboard.deficitBalance")}
            </span>
          </div>

          {/* Barre de ratio Revenus vs Dépenses */}
          <div className="relative mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100 dark:bg-rose-500/35">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revenusRatio}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
              />
            </div>
          </div>

          {/* Mini tuiles Revenus / Dépenses */}
          <div className="relative mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onOpenFinance("revenus")}
              className="apple-press flex items-center justify-between rounded-2xl bg-white/90 p-3 text-left ring-1 ring-slate-200/80 shadow-xs transition-colors hover:bg-white dark:bg-white/8 dark:ring-white/10 dark:shadow-none dark:hover:bg-white/12"
            >
              <div className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  {t("dashboard.revenues")}
                </span>
                <p className="mt-0.5 truncate text-sm font-bold tabular-nums sm:text-base">
                  {formatFcfa(totalRevenus)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/40" />
            </button>

            <button
              type="button"
              onClick={() => onOpenFinance("depenses")}
              className="apple-press flex items-center justify-between rounded-2xl bg-white/90 p-3 text-left ring-1 ring-slate-200/80 shadow-xs transition-colors hover:bg-white dark:bg-white/8 dark:ring-white/10 dark:shadow-none dark:hover:bg-white/12"
            >
              <div className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-300">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t("dashboard.expenses")}
                </span>
                <p className="mt-0.5 truncate text-sm font-bold tabular-nums sm:text-base">
                  {formatFcfa(totalDepenses)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/40" />
            </button>
          </div>
        </motion.section>

        {/* 2. Bandeau d'accès rapides modulaires */}
        <section
          aria-label="Raccourcis modules"
          className="grid grid-cols-4 gap-2 sm:gap-3"
        >
          {[
            {
              label: t("dashboard.shortcuts.finances"),
              Icon: Wallet,
              color: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400",
              onClick: () => onOpenFinance("revenus"),
            },
            {
              label: t("dashboard.shortcuts.projets"),
              Icon: FolderKanban,
              color: "text-indigo-600 bg-indigo-500/12 dark:text-indigo-400",
              onClick: () => onOpenProjets("projets"),
            },
            {
              label: t("dashboard.shortcuts.contacts"),
              Icon: Users,
              color: "text-sky-600 bg-sky-500/12 dark:text-sky-400",
              onClick: () => onOpenFinance("contacts"),
            },
            {
              label: t("dashboard.shortcuts.notes"),
              Icon: StickyNote,
              color: "text-amber-600 bg-amber-500/12 dark:text-amber-400",
              onClick: () => onOpenProjets("notes"),
            },
          ].map((shortcut) => (
            <button
              key={shortcut.label}
              type="button"
              onClick={shortcut.onClick}
              className="apple-press flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2.5 shadow-xs transition-colors hover:border-[var(--primary)]/40"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  shortcut.color,
                )}
              >
                <shortcut.Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-[11px] font-semibold text-[var(--foreground)]">
                {shortcut.label}
              </span>
            </button>
          ))}
        </section>

        {/* 2b. Widget Citation du jour */}
        {displayedQuote && (
          <section
            aria-label="Citation du jour"
            className="apple-surface relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 sm:px-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                  <Quote className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Citation du jour
                    </span>
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-foreground)]">
                      {displayedQuote.categorieLabel ?? displayedQuote.categorie}
                    </span>
                  </div>
                  <p className="text-sm font-medium italic leading-relaxed text-[var(--foreground)]">
                    &laquo;&nbsp;{displayedQuote.contenu}&nbsp;&raquo;
                  </p>
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    — {displayedQuote.auteur}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleNextQuote()}
                disabled={isCyclingQuote}
                title="Autre citation"
                aria-label="Autre citation"
                className="apple-press flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isCyclingQuote && "animate-spin")}
                />
              </button>
            </div>
          </section>
        )}

        {/* 3. Grille Bento KPI 2x2 sur mobile / 4 colonnes sur desktop */}
        <section
          aria-label="Indicateurs clés"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {/* Tâches */}
          <button
            type="button"
            onClick={() => onOpenProjets("taches")}
            className="apple-press flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-xs transition-colors hover:border-indigo-500/40"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t("dashboard.kpi.tasks")}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold tabular-nums text-[var(--foreground)]">
                {pendingTaches.length}
                <span className="ms-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {t("dashboard.kpi.toDo")}
                </span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${tachesProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)] tabular-nums">
                {t("dashboard.kpi.completedRatio", {
                  pct: tachesProgress,
                  done: tachesDoneCount,
                  total: allTaches.length,
                })}
              </p>
            </div>
          </button>

          {/* Projets */}
          <button
            type="button"
            onClick={() => onOpenProjets("projets")}
            className="apple-press flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-xs transition-colors hover:border-sky-500/40"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t("dashboard.kpi.projects")}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-400">
                <FolderKanban className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold tabular-nums text-[var(--foreground)]">
                {projetsActifs.length}
                <span className="ms-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {t("dashboard.kpi.activeCount")}
                </span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${projetsProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)] tabular-nums">
                {t("dashboard.kpi.completedOf", {
                  done: projetsDoneCount,
                  total: allProjets.length,
                })}
              </p>
            </div>
          </button>

          {/* Créances */}
          <button
            type="button"
            onClick={() => onOpenFinance("creances")}
            className="apple-press flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-xs transition-colors hover:border-emerald-500/40"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t("dashboard.kpi.receivables")}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                <HandCoins className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="truncate text-lg font-extrabold tabular-nums text-[var(--foreground)] sm:text-xl">
                {formatFcfa(creancesRestant)}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                {creancesRetard > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    {t("dashboard.kpi.overdueCount", { count: creancesRetard })}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                    {t("dashboard.kpi.toCollect")}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Dettes */}
          <button
            type="button"
            onClick={() => onOpenFinance("dettes")}
            className="apple-press flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-xs transition-colors hover:border-amber-500/40"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {t("dashboard.kpi.debts")}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="truncate text-lg font-extrabold tabular-nums text-[var(--foreground)] sm:text-xl">
                {formatFcfa(dettesRestant)}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                {dettesRetard > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    {t("dashboard.kpi.overdueCount", { count: dettesRetard })}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                    {t("dashboard.kpi.toRepay")}
                  </span>
                )}
              </div>
            </div>
          </button>
        </section>

        {/* 3.5. Bandeau Habitudes du jour */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  {t("dashboard.habitsSection.title")}
                </h2>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {t("dashboard.habitsSection.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenProjets("habitudes")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {t("common.manage")} <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {habitudesList.length === 0 ? (
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[var(--background)] px-3.5 py-2.5">
              <span className="text-xs text-[var(--muted-foreground)]">
                {t("dashboard.habitsSection.empty")}
              </span>
              <button
                type="button"
                onClick={() => onOpenProjets("habitudes")}
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("dashboard.habitsSection.createCta")}
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {habitudesList.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabitude.mutate({ id: h.id })}
                  className={cn(
                    "apple-press inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all",
                    h.completeeAujourdhui
                      ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-indigo-500/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      h.completeeAujourdhui
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[var(--border)] bg-[var(--card)]",
                    )}
                  >
                    {h.completeeAujourdhui && <Check className="h-3 w-3" />}
                  </span>
                  <span>{h.titre}</span>
                  {h.serieActuelle > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 tabular-nums dark:text-amber-400">
                      <Flame className="h-2.5 w-2.5" />
                      {h.serieActuelle}j
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 4. Graphique SVG Trésorerie & Épargne */}
        <CashFlowChart
          totalRevenus={totalRevenus}
          totalDepenses={totalDepenses}
          totalCreancesRestant={creancesRestant}
          totalDettesRestant={dettesRestant}
        />

        {/* 5. Activité récente & Priorités (2 colonnes sur desktop) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Derniers mouvements financiers */}
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {t("dashboard.movements.title")}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("dashboard.movements.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenFinance("revenus")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("dashboard.shortcuts.finances")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentMovements.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-center text-sm text-[var(--muted-foreground)]">
                {t("dashboard.movements.empty")}
              </p>
            ) : (
              <ul className="mt-3.5 space-y-2">
                {recentMovements.map((m) => {
                  const isRev = m.kind === "revenu";
                  return (
                    <li
                      key={m.id}
                      onClick={() =>
                        onOpenFinance(isRev ? "revenus" : "depenses")
                      }
                      className="apple-press flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--background)] px-3.5 py-2.5 transition-colors hover:border-[var(--primary)]/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isRev
                              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/12 text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {isRev ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {m.description}
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)] tabular-nums">
                            {formatDateUtc(m.date)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold tabular-nums",
                          isRev
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {isRev ? "+" : "-"}
                        {formatFcfa(m.montant)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Prochaines tâches avec validation 1-tap */}
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {t("dashboard.priorityTasks.title")}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("dashboard.priorityTasks.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenProjets("taches")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("common.allSee")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {pendingTaches.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-center text-sm text-[var(--muted-foreground)]">
                {t("dashboard.priorityTasks.empty")}
              </p>
            ) : (
              <ul className="mt-3.5 space-y-2">
                {pendingTaches.slice(0, 4).map((tache) => {
                  const badge = getDeadlineBadge(
                    tache.dateLimite,
                    tache.estTerminee,
                  );
                  return (
                    <li
                      key={tache.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--background)] px-3.5 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateTache.mutate({
                              id: tache.id,
                              dto: { estTerminee: true },
                            })
                          }
                          aria-label={`Terminer ${tache.titre}`}
                          className="apple-press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {tache.titre}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] tabular-nums">
                            <CalendarClock className="h-3 w-3" />
                            {formatDateUtc(tache.dateLimite)} · {badge.label}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* 6. Projets actifs & Notes récentes (2 colonnes sur desktop) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Projets en cours */}
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {t("dashboard.activeProjects.title")}
              </h2>
              <button
                type="button"
                onClick={() => onOpenProjets("projets")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("dashboard.shortcuts.projets")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {projetsActifs.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-center text-sm text-[var(--muted-foreground)]">
                {t("dashboard.activeProjects.empty")}
              </p>
            ) : (
              <ul className="mt-3.5 space-y-2">
                {projetsActifs.slice(0, 3).map((projet) => (
                  <li key={projet.id}>
                    <button
                      type="button"
                      onClick={() => onOpenProjets("projets")}
                      className="apple-press flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--background)] px-3.5 py-3 text-left transition-colors hover:border-indigo-500/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
                          <FolderKanban className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {projet.titre}
                          </p>
                          <p className="truncate text-[11px] text-[var(--muted-foreground)] tabular-nums">
                            {t("dashboard.activeProjects.startPrefix")}{" "}
                            {formatDateUtc(projet.dateDebut)}
                            {projet.dateFin
                              ? ` · ${t("dashboard.activeProjects.endPrefix")} ${formatDateUtc(projet.dateFin)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Dernières notes */}
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {t("dashboard.recentNotes.title")}
              </h2>
              <button
                type="button"
                onClick={() => onOpenProjets("notes")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {t("dashboard.shortcuts.notes")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-center text-sm text-[var(--muted-foreground)]">
                {t("dashboard.recentNotes.empty")}
              </p>
            ) : (
              <ul className="mt-3.5 space-y-2">
                {recentNotes.slice(0, 3).map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => onOpenProjets("notes")}
                      className="apple-press flex w-full items-start gap-3 rounded-2xl border border-[var(--border)]/60 bg-[var(--background)] p-3 text-left transition-colors hover:border-amber-500/40"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                        <StickyNote className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                          {note.titre}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted-foreground)]">
                          {note.contenu}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}
