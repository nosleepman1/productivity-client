import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Header } from "./components/layout/Header";
import { BottomNav, type NavTab } from "./components/layout/BottomNav";
import { FinanceView, type Transaction } from "./components/views/FinanceView";
import { ProjetsView, type Project, type TaskItem } from "./components/views/ProjetsView";
import { IdeesView, type IdeaItem } from "./components/views/IdeesView";
import { ParametresView } from "./components/views/ParametresView";
import { QuickAddModal } from "./components/modals/QuickAddModal";

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    title: "Virement Client SaaS - Q4",
    amount: 4250.0,
    type: "income",
    category: "Revenus Pro",
    date: "Aujourd'hui, 14:32",
  },
  {
    id: "tx-2",
    title: "Abonnement Vercel Pro",
    amount: 20.0,
    type: "expense",
    category: "Infrastructure",
    date: "Hier, 09:15",
  },
  {
    id: "tx-3",
    title: "Prestation Audit UI/UX",
    amount: 1800.0,
    type: "income",
    category: "Consulting",
    date: "12 Nov",
  },
  {
    id: "tx-4",
    title: "Licence JetBrains & GitHub Copilot",
    amount: 45.0,
    type: "expense",
    category: "Outils Dev",
    date: "10 Nov",
  },
  {
    id: "tx-5",
    title: "Serveurs Base de données Cloud",
    amount: 140.0,
    type: "expense",
    category: "Infrastructure",
    date: "08 Nov",
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Refonte Mobile App & Design System",
    tag: "Design / Front",
    priority: "Urgente",
    progress: 85,
    deadline: "18 Nov 2026",
    completedTasks: 12,
    totalTasks: 14,
  },
  {
    id: "proj-2",
    title: "Architecture API & Sync Données",
    tag: "Backend",
    priority: "Prioritaire",
    progress: 55,
    deadline: "25 Nov 2026",
    completedTasks: 5,
    totalTasks: 9,
  },
  {
    id: "proj-3",
    title: "Intégration Paiements Stripe & Facturation",
    tag: "Fintech",
    priority: "Normale",
    progress: 30,
    deadline: "02 Déc 2026",
    completedTasks: 3,
    totalTasks: 10,
  },
  {
    id: "proj-4",
    title: "Optimisation SEO & Analytics",
    tag: "Marketing",
    priority: "Normale",
    progress: 90,
    deadline: "Cette semaine",
    completedTasks: 9,
    totalTasks: 10,
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Valider la navigation bottom style WhatsApp/Instagram",
    project: "Refonte Mobile App",
    completed: true,
    dueDate: "Aujourd'hui",
  },
  {
    id: "task-2",
    title: "Régler les tokens de thème clair/sombre Shadcn",
    project: "Refonte Mobile App",
    completed: true,
    dueDate: "Aujourd'hui",
  },
  {
    id: "task-3",
    title: "Déployer les endpoints Trésorerie & Budgets",
    project: "Architecture API",
    completed: false,
    dueDate: "Demain, 11:00",
  },
  {
    id: "task-4",
    title: "Rédiger le rapport de sprint Q4 pour l'équipe",
    project: "Management",
    completed: false,
    dueDate: "Jeudi",
  },
];

const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: "idea-1",
    title: "Assistant IA pour prédire la trésorerie du mois",
    category: "Produit",
    description:
      "Analyser automatiquement les flux récurrents (abonnements, contrats clients) et générer une alerte en cas de creux de cash prévisible.",
    starred: true,
    votes: 18,
    date: "14 Nov",
    status: "Validée",
  },
  {
    id: "idea-2",
    title: "Widget iOS / Android pour saisie instantanée d'une dépense",
    category: "Quick Win",
    description:
      "Un bouton rapide sur l'écran d'accueil du smartphone qui ouvre directement la caméra pour scanner un reçu ou saisir un montant en 3 secondes.",
    starred: true,
    votes: 12,
    date: "13 Nov",
    status: "À tester",
  },
  {
    id: "idea-3",
    title: "Mode Focus Pomodoro synchronisé avec les projets",
    category: "Stratégie",
    description:
      "Associer chaque session de 25 minutes à une tâche spécifique du tableau de bord pour mesurer le temps réel passé.",
    starred: false,
    votes: 7,
    date: "11 Nov",
    status: "En réflexion",
  },
  {
    id: "idea-4",
    title: "Système de parrainage et partage de templates de productivité",
    category: "Growth",
    description:
      "Permettre aux utilisateurs de dupliquer des structures de projets prêtes à l'emploi et d'inviter des collaborateurs.",
    starred: false,
    votes: 15,
    date: "09 Nov",
    status: "En réflexion",
  },
];

function ProductivityApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("finance");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [ideas, setIdeas] = useState<IdeaItem[]>(INITIAL_IDEAS);

  // Handlers for Additions
  const handleAddTransaction = (newTx: {
    title: string;
    amount: number;
    type: "income" | "expense";
    category: string;
  }) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      title: newTx.title,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      date: "À l'instant",
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleAddProject = (newProj: {
    title: string;
    tag: string;
    deadline: string;
  }) => {
    const proj: Project = {
      id: `proj-${Date.now()}`,
      title: newProj.title,
      tag: newProj.tag,
      priority: "Prioritaire",
      progress: 10,
      deadline: newProj.deadline,
      completedTasks: 0,
      totalTasks: 5,
    };
    setProjects((prev) => [proj, ...prev]);
  };

  const handleAddIdea = (newIdea: {
    title: string;
    category: string;
    description: string;
  }) => {
    const idea: IdeaItem = {
      id: `idea-${Date.now()}`,
      title: newIdea.title,
      category: newIdea.category,
      description: newIdea.description || "Nouvelle note d'opportunité ajoutée.",
      starred: false,
      votes: 1,
      date: "Aujourd'hui",
      status: "En réflexion",
    };
    setIdeas((prev) => [idea, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleToggleStar = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, starred: !i.starred } : i))
    );
  };

  const handleUpvote = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, votes: i.votes + 1 } : i))
    );
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setIdeas(INITIAL_IDEAS);
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Top Global Productivity Header */}
      <Header activeTab={activeTab} />

      {/* 2. Main Content Canvas */}
      <main className="mx-auto max-w-4xl px-4 pt-5 pb-28 sm:px-6">
        {activeTab === "finance" && (
          <FinanceView
            transactions={transactions}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === "projets" && (
          <ProjetsView
            projects={projects}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === "idees" && (
          <IdeesView
            ideas={ideas}
            onToggleStar={handleToggleStar}
            onUpvote={handleUpvote}
            onQuickAddIdea={(title) =>
              handleAddIdea({ title, category: "Produit", description: "" })
            }
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === "parametres" && (
          <ParametresView onResetData={handleResetData} />
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
        onAddTransaction={handleAddTransaction}
        onAddProject={handleAddProject}
        onAddIdea={handleAddIdea}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProductivityApp />
    </ThemeProvider>
  );
}
