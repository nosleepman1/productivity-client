import { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "./components/ui/ToastContainer";
import { useLogoutMutation } from "./features/auth/hooks/useAuth";
import { useActiveEspace } from "./features/espaces/hooks/useEspaces";
import { useTaches } from "./features/productivity/hooks/useTaches";
import { Header } from "./components/layout/Header";
import { BottomNav, type NavTab } from "./components/layout/BottomNav";
import { LoadingPerson } from "./components/ui/LoadingPerson";
import { DashboardView } from "./components/views/DashboardView";
import type { FinanceTab } from "./components/views/FinanceView";
import type { ProjetsSubTab } from "./components/views/ProjetsView";
import type { ParametresSubTab } from "./components/views/ParametresView";

const FinanceView = lazy(() =>
  import("./components/views/FinanceView").then((m) => ({
    default: m.FinanceView,
  })),
);
const ProjetsView = lazy(() =>
  import("./components/views/ProjetsView").then((m) => ({
    default: m.ProjetsView,
  })),
);
const ParametresView = lazy(() =>
  import("./components/views/ParametresView").then((m) => ({
    default: m.ParametresView,
  })),
);
const QuickAddModal = lazy(() =>
  import("./components/modals/QuickAddModal").then((m) => ({
    default: m.QuickAddModal,
  })),
);
const IaCopilotModal = lazy(() =>
  import("./components/modals/IaCopilotModal").then((m) => ({
    default: m.IaCopilotModal,
  })),
);
const OnboardingModal = lazy(() =>
  import("./components/modals/OnboardingModal").then((m) => ({
    default: m.OnboardingModal,
  })),
);
const NotificationDrawerModal = lazy(() =>
  import("./components/modals/NotificationDrawerModal").then((m) => ({
    default: m.NotificationDrawerModal,
  })),
);

const FINANCE_SUB_LABELS: Record<FinanceTab, string> = {
  revenus: "Revenus",
  depenses: "Dépenses",
  dettes: "Dettes",
  creances: "Créances",
  contacts: "Contacts",
};

const PROJETS_SUB_LABELS: Record<ProjetsSubTab, string> = {
  projets: "Projets",
  taches: "Tâches",
  habitudes: "Habitudes",
  notes: "Notes",
};

const VALID_TABS: NavTab[] = ["dashboard", "finance", "projets", "parametres"];
const VALID_FINANCE_SUBS: FinanceTab[] = [
  "revenus",
  "depenses",
  "dettes",
  "creances",
  "contacts",
];
const VALID_PROJETS_SUBS: ProjetsSubTab[] = [
  "projets",
  "taches",
  "habitudes",
  "notes",
];
const VALID_PARAMETRES_SUBS: ParametresSubTab[] = [
  "compte",
  "abonnement",
  "apparence",
  "preferences",
];

function ProductivityApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get("tab") as NavTab | null;
  const initialSubParam = searchParams.get("sub");

  const [activeTab, setActiveTab] = useState<NavTab>(
    initialTabParam && VALID_TABS.includes(initialTabParam)
      ? initialTabParam
      : "dashboard",
  );
  const [financeSubTab, setFinanceSubTab] = useState<FinanceTab>(
    initialSubParam && VALID_FINANCE_SUBS.includes(initialSubParam as FinanceTab)
      ? (initialSubParam as FinanceTab)
      : "revenus",
  );
  const [projetsSubTab, setProjetsSubTab] = useState<ProjetsSubTab>(
    initialSubParam &&
      VALID_PROJETS_SUBS.includes(initialSubParam as ProjetsSubTab)
      ? (initialSubParam as ProjetsSubTab)
      : "projets",
  );
  const [parametresSubTab, setParametresSubTab] = useState<ParametresSubTab>(
    initialSubParam &&
      VALID_PARAMETRES_SUBS.includes(initialSubParam as ParametresSubTab)
      ? (initialSubParam as ParametresSubTab)
      : "compte",
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isIaCopilotOpen, setIsIaCopilotOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOnboardingManualOpen, setIsOnboardingManualOpen] = useState(false);

  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const { activeEspaceId } = useActiveEspace();
  const tachesQuery = useTaches(activeEspaceId, { page: 1, limit: 50 });

  // Synchronise l'état de navigation vers les paramètres d'URL (?tab=...&sub=...)
  useEffect(() => {
    const nextParams = new URLSearchParams();
    nextParams.set("tab", activeTab);
    if (activeTab === "finance") {
      nextParams.set("sub", financeSubTab);
    } else if (activeTab === "projets") {
      nextParams.set("sub", projetsSubTab);
    } else if (activeTab === "parametres") {
      nextParams.set("sub", parametresSubTab);
    }
    setSearchParams(nextParams, { replace: true });
  }, [
    activeTab,
    financeSubTab,
    projetsSubTab,
    parametresSubTab,
    setSearchParams,
  ]);

  const pendingTasksCount = (tachesQuery.data?.data ?? []).filter(
    (t) => !t.estTerminee,
  ).length;

  const headerSubTitle =
    activeTab === "finance"
      ? FINANCE_SUB_LABELS[financeSubTab]
      : activeTab === "projets"
        ? PROJETS_SUB_LABELS[projetsSubTab]
        : undefined;

  const handleOpenFinance = (subTab?: FinanceTab) => {
    if (subTab) setFinanceSubTab(subTab);
    setActiveTab("finance");
  };

  const handleOpenProjets = (subTab?: ProjetsSubTab) => {
    if (subTab) setProjetsSubTab(subTab);
    setActiveTab("projets");
  };

  const handleOpenSubscriptions = () => {
    setIsIaCopilotOpen(false);
    setParametresSubTab("abonnement");
    setActiveTab("parametres");
  };

  const handleNavigateFromNotification = (lien: string) => {
    try {
      const parsed = new URL(lien, window.location.origin);
      const tab = parsed.searchParams.get("tab") as NavTab | null;
      const sub = parsed.searchParams.get("sub");
      if (tab && VALID_TABS.includes(tab)) {
        setActiveTab(tab);
        if (
          tab === "finance" &&
          sub &&
          VALID_FINANCE_SUBS.includes(sub as FinanceTab)
        ) {
          setFinanceSubTab(sub as FinanceTab);
        } else if (
          tab === "projets" &&
          sub &&
          VALID_PROJETS_SUBS.includes(sub as ProjetsSubTab)
        ) {
          setProjetsSubTab(sub as ProjetsSubTab);
        }
      }
    } catch {
      // Ignore malformed links
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* 1. Top Global Productivity Header */}
      <Header
        activeTab={activeTab}
        subTitle={headerSubTitle}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* 2. Scrollable Main Content Canvas */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto max-w-4xl px-4 pt-5 pb-12 sm:px-6">
          {activeTab === "dashboard" && (
            <DashboardView
              onOpenFinance={handleOpenFinance}
              onOpenProjets={handleOpenProjets}
            />
          )}
          <Suspense
            fallback={
              <LoadingPerson compact label="Chargement du module..." />
            }
          >
            {activeTab === "finance" && (
              <FinanceView activeSubTab={financeSubTab} />
            )}
            {activeTab === "projets" && (
              <ProjetsView activeSubTab={projetsSubTab} />
            )}
            {activeTab === "parametres" && (
              <ParametresView
                activeSubTab={parametresSubTab}
                onSubTabChange={setParametresSubTab}
                onResetData={() => void queryClient.invalidateQueries()}
                onLogout={() => logoutMutation.mutate()}
                onOpenOnboarding={() => setIsOnboardingManualOpen(true)}
              />
            )}
          </Suspense>
        </div>
      </main>

      {/* 3. Contextual Nested Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPlusClick={() => setIsIaCopilotOpen(true)}
        financeSubTab={financeSubTab}
        onFinanceSubTabChange={setFinanceSubTab}
        projetsSubTab={projetsSubTab}
        onProjetsSubTabChange={setProjetsSubTab}
        onExitNestedNav={() => setActiveTab("dashboard")}
        badges={{
          projets: pendingTasksCount > 0 ? pendingTasksCount : false,
        }}
      />

      {/* 4. AI Copilot, Quick Add, Notification Center & Onboarding (Lazy) */}
      <Suspense fallback={null}>
        <IaCopilotModal
          open={isIaCopilotOpen}
          onOpenChange={setIsIaCopilotOpen}
          onOpenManualQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSubscriptions={handleOpenSubscriptions}
        />

        <QuickAddModal
          open={isQuickAddOpen}
          onOpenChange={setIsQuickAddOpen}
        />

        <NotificationDrawerModal
          open={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onNavigateLink={handleNavigateFromNotification}
        />

        <OnboardingModal
          forceOpen={isOnboardingManualOpen}
          onClose={() => setIsOnboardingManualOpen(false)}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastContainer />
      <AppRoutes dashboard={<ProductivityApp />} />
    </ThemeProvider>
  );
}
