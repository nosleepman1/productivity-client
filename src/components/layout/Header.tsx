import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Sparkles, Bell, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  activeTab: "finance" | "projets" | "idees" | "parametres";
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();

  const titles: Record<string, { title: string; subtitle: string; icon: string }> = {
    finance: {
      title: "Finances & Budget",
      subtitle: "Suivi de trésorerie & flux financiers",
      icon: "💳",
    },
    projets: {
      title: "Espace Projets",
      subtitle: "Gestion agile, jalons & tâches",
      icon: "🎯",
    },
    idees: {
      title: "Boîte à Idées",
      subtitle: "Inspiration, notes & opportunités",
      icon: "💡",
    },
    parametres: {
      title: "Paramètres",
      subtitle: "Préférences, thème & configuration",
      icon: "⚙️",
    },
  };

  const current = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Left Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/90 to-primary/60 text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {current.title}
              </h1>
              <span className="text-xs">{current.icon}</span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Quick theme indicator pill */}
          <button
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 p-0 text-foreground shadow-xs transition-all duration-200 hover:border-primary/50 hover:bg-accent active:scale-95"
            title={`Mode actuel: ${theme === "system" ? `Système (${resolvedTheme})` : theme}. Cliquez pour basculer.`}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:-rotate-12" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
            )}
            <span className="sr-only">Changer de thème</span>
          </button>

          {/* Notifications Button */}
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 p-0 text-muted-foreground shadow-xs transition-all duration-200 hover:text-foreground hover:bg-accent active:scale-95"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </button>

          {/* User mini status */}
          <div className="ml-1 hidden items-center gap-2 rounded-full border border-border bg-card/50 py-1 pl-1.5 pr-2.5 sm:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              AD
            </div>
            <span className="text-xs font-medium text-foreground">Pro</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
