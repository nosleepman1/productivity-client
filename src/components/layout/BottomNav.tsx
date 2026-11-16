import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BrainCircuit,
  CheckSquare,
  Flame,
  FolderKanban,
  Home,
  Lightbulb,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { FinanceTab } from "@/components/views/FinanceView";
import type { ProjetsSubTab } from "@/components/views/ProjetsView";
import { useAiName } from "@/features/ia/hooks/useIa";
import { cn } from "@/lib/utils";

/**
 * Onglets principaux de la barre de navigation inférieure.
 */
export type NavTab = "dashboard" | "finance" | "projets" | "parametres";

/**
 * Propriétés du composant `BottomNav` gérant la navigation principale et ses sous-barres imbriquées.
 */
export interface BottomNavProps {
  /** Onglet racine actuellement actif. */
  activeTab: NavTab;
  /** Callback appelé lors de la sélection d'un onglet racine. */
  onTabChange: (tab: NavTab) => void;
  /** Callback appelé lors du clic sur le bouton central d'ajout rapide (`+`). */
  onPlusClick: () => void;
  /** Sous-onglet financier actif lorsque `activeTab === "finance"`. */
  financeSubTab: FinanceTab;
  /** Callback appelé lors du changement de sous-onglet financier. */
  onFinanceSubTabChange: (tab: FinanceTab) => void;
  /** Sous-onglet projet actif lorsque `activeTab === "projets"`. */
  projetsSubTab: ProjetsSubTab;
  /** Callback appelé lors du changement de sous-onglet projet. */
  onProjetsSubTabChange: (tab: ProjetsSubTab) => void;
  /** Callback appelé par le bouton croix (`X`) pour quitter une sous-barre et revenir au tableau de bord. */
  onExitNestedNav: () => void;
  /** Badges optionnels affichés sur les onglets racine. */
  badges?: Partial<Record<NavTab, number | boolean>>;
}

interface SubNavItem<T extends string> {
  id: T;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  pillClass: string;
}

const FINANCE_SUB_ITEMS: SubNavItem<FinanceTab>[] = [
  {
    id: "revenus",
    label: "Revenus",
    Icon: TrendingUp,
    activeClass: "text-emerald-700 dark:text-emerald-300",
    pillClass: "bg-emerald-500/14 ring-1 ring-emerald-500/25 dark:bg-emerald-500/22",
  },
  {
    id: "depenses",
    label: "Dépenses",
    Icon: Receipt,
    activeClass: "text-rose-700 dark:text-rose-300",
    pillClass: "bg-rose-500/14 ring-1 ring-rose-500/25 dark:bg-rose-500/22",
  },
  {
    id: "dettes",
    label: "Dettes",
    Icon: ArrowUpRight,
    activeClass: "text-amber-700 dark:text-amber-300",
    pillClass: "bg-amber-500/14 ring-1 ring-amber-500/25 dark:bg-amber-500/22",
  },
  {
    id: "creances",
    label: "Créances",
    Icon: ArrowDownLeft,
    activeClass: "text-sky-700 dark:text-sky-300",
    pillClass: "bg-sky-500/14 ring-1 ring-sky-500/25 dark:bg-sky-500/22",
  },
  {
    id: "contacts",
    label: "Contacts",
    Icon: Users,
    activeClass: "text-indigo-700 dark:text-indigo-300",
    pillClass: "bg-indigo-500/14 ring-1 ring-indigo-500/25 dark:bg-indigo-500/22",
  },
];

const PROJETS_SUB_ITEMS: SubNavItem<ProjetsSubTab>[] = [
  {
    id: "projets",
    label: "Projets",
    Icon: FolderKanban,
    activeClass: "text-indigo-700 dark:text-indigo-300",
    pillClass: "bg-indigo-500/14 ring-1 ring-indigo-500/25 dark:bg-indigo-500/22",
  },
  {
    id: "taches",
    label: "Tâches",
    Icon: CheckSquare,
    activeClass: "text-sky-700 dark:text-sky-300",
    pillClass: "bg-sky-500/14 ring-1 ring-sky-500/25 dark:bg-sky-500/22",
  },
  {
    id: "habitudes",
    label: "Habitudes",
    Icon: Flame,
    activeClass: "text-orange-700 dark:text-orange-300",
    pillClass: "bg-orange-500/14 ring-1 ring-orange-500/25 dark:bg-orange-500/22",
  },
  {
    id: "notes",
    label: "Notes",
    Icon: Lightbulb,
    activeClass: "text-amber-700 dark:text-amber-300",
    pillClass: "bg-amber-500/14 ring-1 ring-amber-500/25 dark:bg-amber-500/22",
  },
];

const BAR_TRANSITION = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

/**
 * Barre de navigation inférieure contextuelle avec imbrication animée pour Finances et Projets.
 */
export function BottomNav({
  activeTab,
  onTabChange,
  onPlusClick,
  financeSubTab,
  onFinanceSubTabChange,
  projetsSubTab,
  onProjetsSubTabChange,
  onExitNestedNav,
  badges = {},
}: BottomNavProps) {
  const { t } = useTranslation();
  const barMode: "root" | "finance" | "projets" =
    activeTab === "finance"
      ? "finance"
      : activeTab === "projets"
        ? "projets"
        : "root";

  const renderBadge = (tab: NavTab) => {
    const val = badges[tab];
    if (!val) return null;
    if (typeof val === "number" && val > 0) {
      return (
        <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white tabular-nums shadow-sm">
          {val > 99 ? "99+" : val}
        </span>
      );
    }
    return (
      <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
    );
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="apple-glass-bar apple-surface relative z-40 shrink-0 border-t border-slate-200/70 pb-[env(safe-area-inset-bottom)] dark:border-slate-800/70"
    >
      <div className="mx-auto max-w-2xl px-2">
        <AnimatePresence mode="wait" initial={false}>
          {barMode === "root" && (
            <motion.div
              key="root-bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={BAR_TRANSITION}
              className="grid h-16 grid-cols-5 items-center gap-1"
            >
              <RootNavButton
                label={t("nav.dashboard")}
                Icon={Home}
                isActive={activeTab === "dashboard"}
                badge={renderBadge("dashboard")}
                onClick={() => onTabChange("dashboard")}
              />
              <RootNavButton
                label={t("nav.finance")}
                Icon={Wallet}
                isActive={false}
                badge={renderBadge("finance")}
                onClick={() => onTabChange("finance")}
              />

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={onPlusClick}
                  aria-label={t("ia.title")}
                  title={t("ia.title")}
                  className="apple-press group relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-xl shadow-indigo-500/40 ring-4 ring-white transition-transform hover:scale-105 active:scale-95 dark:ring-slate-950"
                >
                  <BrainCircuit className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
                </button>
              </div>

              <RootNavButton
                label={t("nav.projets")}
                Icon={FolderKanban}
                isActive={false}
                badge={renderBadge("projets")}
                onClick={() => onTabChange("projets")}
              />
              <RootNavButton
                label={t("nav.parametres")}
                Icon={Settings}
                isActive={activeTab === "parametres"}
                badge={renderBadge("parametres")}
                onClick={() => onTabChange("parametres")}
              />
            </motion.div>
          )}

          {barMode === "finance" && (
            <motion.div
              key="finance-bar"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={BAR_TRANSITION}
              className="flex h-16 items-center gap-1.5"
            >
              <div
                role="tablist"
                aria-label="Navigation Finances"
                className="grid flex-1 grid-cols-5 items-center gap-0.5"
              >
                {FINANCE_SUB_ITEMS.map((item) => (
                  <SubNavButton
                    key={item.id}
                    label={t(`finances.tabs.${item.id}`)}
                    Icon={item.Icon}
                    isActive={financeSubTab === item.id}
                    activeClass={item.activeClass}
                    pillClass={item.pillClass}
                    layoutGroup="finance-subnav-pill"
                    onClick={() => onFinanceSubTabChange(item.id)}
                  />
                ))}
              </div>
              <CloseNestedButton
                label="Fermer Finances et revenir au tableau de bord"
                onClick={onExitNestedNav}
                onPlusClick={onPlusClick}
              />
            </motion.div>
          )}

          {barMode === "projets" && (
            <motion.div
              key="projets-bar"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={BAR_TRANSITION}
              className="flex h-16 items-center gap-1.5"
            >
              <div
                role="tablist"
                aria-label="Navigation Projets"
                className="grid flex-1 grid-cols-4 items-center gap-1"
              >
                {PROJETS_SUB_ITEMS.map((item) => (
                  <SubNavButton
                    key={item.id}
                    label={t(
                      item.id === "notes"
                        ? "idees.title"
                        : `projets.tabs.${item.id}`,
                    )}
                    Icon={item.Icon}
                    isActive={projetsSubTab === item.id}
                    activeClass={item.activeClass}
                    pillClass={item.pillClass}
                    layoutGroup="projets-subnav-pill"
                    badge={
                      item.id === "taches" &&
                      typeof badges.projets === "number" &&
                      badges.projets > 0
                        ? badges.projets
                        : undefined
                    }
                    onClick={() => onProjetsSubTabChange(item.id)}
                  />
                ))}
              </div>
              <CloseNestedButton
                label="Fermer Projets et revenir au tableau de bord"
                onClick={onExitNestedNav}
                onPlusClick={onPlusClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

interface RootNavButtonProps {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: React.ReactNode;
  onClick: () => void;
}

function RootNavButton({
  label,
  Icon,
  isActive,
  badge,
  onClick,
}: RootNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "apple-press relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors",
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badge}
      </div>
      <span className="truncate">{label}</span>
    </button>
  );
}

interface SubNavButtonProps {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  activeClass: string;
  pillClass: string;
  layoutGroup: string;
  badge?: number;
  onClick: () => void;
}

function SubNavButton({
  label,
  Icon,
  isActive,
  activeClass,
  pillClass,
  layoutGroup,
  badge,
  onClick,
}: SubNavButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "apple-press relative flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10.5px] font-semibold transition-colors",
        isActive
          ? activeClass
          : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
      )}
    >
      {isActive && (
        <motion.span
          layoutId={layoutGroup}
          transition={BAR_TRANSITION}
          className={cn("absolute inset-0 rounded-2xl", pillClass)}
        />
      )}
      <div className="relative z-10">
        <Icon className="h-4.5 w-4.5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white tabular-nums">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className="relative z-10 max-w-full truncate leading-tight">
        {label}
      </span>
    </button>
  );
}

interface CloseNestedButtonProps {
  label: string;
  onClick: () => void;
  onPlusClick?: () => void;
}

function CloseNestedButton({
  label,
  onClick,
  onPlusClick,
}: CloseNestedButtonProps) {
  const aiName = useAiName();
  return (
    <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200/80 dark:border-slate-800/80">
      {onPlusClick && (
        <button
          type="button"
          onClick={onPlusClick}
          aria-label={aiName}
          title={aiName}
          className="apple-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-sm"
        >
          <BrainCircuit className="h-4.5 w-4.5" />
        </button>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title="Revenir au tableau de bord"
        className="apple-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
