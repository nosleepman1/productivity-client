import React from "react";
import {
  Wallet,
  FolderKanban,
  Plus,
  Lightbulb,
  Settings,
} from "lucide-react";

export type NavTab = "finance" | "projets" | "idees" | "parametres";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onPlusClick: () => void;
  badges?: {
    finance?: number | boolean;
    projets?: number | boolean;
    idees?: number | boolean;
    parametres?: number | boolean;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onPlusClick,
  badges = {},
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none pb-safe">
      {/* Mobile & Tablet Bar Container */}
      <nav
        aria-label="Navigation principale"
        className="apple-glass-bar apple-surface pointer-events-auto w-full max-w-lg md:mb-4 md:rounded-2xl border-t md:border px-3 py-2"
      >
        <div className="relative flex items-center justify-between">
          {/* 1. GAUCHE: FINANCE */}
          <button
            type="button"
            onClick={() => onTabChange("finance")}
            className="group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95"
            aria-label="Finance"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                activeTab === "finance"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Wallet
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={activeTab === "finance" ? 2.4 : 1.8}
              />
              {badges.finance && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight transition-colors duration-200 ${
                activeTab === "finance"
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Finance
            </span>
            {activeTab === "finance" && (
              <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* 2. GAUCHE: PROJETS */}
          <button
            type="button"
            onClick={() => onTabChange("projets")}
            className="group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95"
            aria-label="Projets"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                activeTab === "projets"
                  ? "bg-primary/15 text-primary font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <FolderKanban
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={activeTab === "projets" ? 2.4 : 1.8}
              />
              {badges.projets && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                  {typeof badges.projets === "number" ? badges.projets : ""}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight transition-colors duration-200 ${
                activeTab === "projets"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Projets
            </span>
            {activeTab === "projets" && (
              <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-primary" />
            )}
          </button>

          {/* 3. MILIEU: BOUTON CENTRAL "+" (WhatsApp / Instagram Elevated Floating FAB) */}
          <div className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={onPlusClick}
              aria-label="Créer rapidement"
              className="group relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-indigo-600 to-violet-500 text-white shadow-xl shadow-primary/35 ring-4 ring-background dark:ring-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/45 active:scale-90"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <Plus
                className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-90 group-active:scale-90"
                strokeWidth={2.6}
              />
              {/* Subtle ambient light aura */}
              <span className="absolute -inset-1 -z-10 rounded-full bg-primary/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* 4. DROITE: IDÉES */}
          <button
            type="button"
            onClick={() => onTabChange("idees")}
            className="group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95"
            aria-label="Idées"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                activeTab === "idees"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Lightbulb
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={activeTab === "idees" ? 2.4 : 1.8}
              />
              {badges.idees && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight transition-colors duration-200 ${
                activeTab === "idees"
                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Idées
            </span>
            {activeTab === "idees" && (
              <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-amber-500" />
            )}
          </button>

          {/* 5. DROITE: PARAMÈTRES */}
          <button
            type="button"
            onClick={() => onTabChange("parametres")}
            className="group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95"
            aria-label="Paramètres"
          >
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                activeTab === "parametres"
                  ? "bg-secondary text-foreground font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Settings
                className="h-5 w-5 transition-transform duration-200 group-hover:rotate-45"
                strokeWidth={activeTab === "parametres" ? 2.4 : 1.8}
              />
              {badges.parametres && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight transition-colors duration-200 ${
                activeTab === "parametres"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Paramètres
            </span>
            {activeTab === "parametres" && (
              <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-foreground" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};

