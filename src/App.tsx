import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "./components/ui/ToastContainer";
import { useLogoutMutation } from "./features/auth/hooks/useAuth";
import { useActiveEspace } from "./features/espaces/hooks/useEspaces";
import { useTaches } from "./features/productivity/hooks/useTaches";
import { Header } from "./components/layout/Header";
import { BottomNav, type NavTab } from "./components/layout/BottomNav";
import { FinanceView } from "./components/views/FinanceView";
import { ProjetsView } from "./components/views/ProjetsView";
import { IdeesView } from "./components/views/IdeesView";
import { ParametresView } from "./components/views/ParametresView";
import { QuickAddModal } from "./components/modals/QuickAddModal";

function ProductivityApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("finance");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const { activeEspaceId } = useActiveEspace();
  const tachesQuery = useTaches(activeEspaceId, { page: 1, limit: 50 });

  const pendingTasksCount = (tachesQuery.data?.data ?? []).filter(
    (t) => !t.estTerminee,
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Top Global Productivity Header */}
      <Header activeTab={activeTab} />

      {/* 2. Main Content Canvas */}
      <main className="mx-auto max-w-4xl px-4 pt-5 pb-28 sm:px-6">
        {activeTab === "finance" && <FinanceView />}
        {activeTab === "projets" && <ProjetsView />}
        {activeTab === "idees" && <IdeesView />}
        {activeTab === "parametres" && (
          <ParametresView
            onResetData={() => void queryClient.invalidateQueries()}
            onLogout={() => logoutMutation.mutate()}
          />
        )}
      </main>

      {/* 3. Mobile WhatsApp / Instagram 5-Item Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPlusClick={() => setIsQuickAddOpen(true)}
        badges={{
          projets: pendingTasksCount > 0 ? pendingTasksCount : false,
          idees: true,
        }}
      />

      {/* 4. Quick Add Central Action Dialog */}
      <QuickAddModal
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
      />
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
