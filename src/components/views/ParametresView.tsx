import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  Bell,
  Coins,
  Briefcase,
  ChevronRight,
  LogOut,
  RotateCcw,
} from "lucide-react";

interface ParametresViewProps {
  onResetData?: () => void;
  onLogout?: () => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({
  onResetData,
  onLogout,
}) => {
  const { theme, setTheme, themePreset, setThemePreset } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState("EUR (€)");
  const [activeWorkspace, setActiveWorkspace] = useState("Personnel");
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    onResetData?.();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Compte / Profil (Apple Settings Header Row) */}
      <Card className="apple-surface border-border/80 bg-card p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 min-h-[68px]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              AD
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                Abdallah DIOUF
              </h2>
              <p className="text-xs text-muted-foreground">
                Compte Pro · Synchronisation prête
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
        </div>
      </Card>

      {/* 2. Espace de travail (Multi-Espaces API) */}
      <div className="space-y-1.5">
        <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Espace de travail
        </h3>
        <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Espace actif</p>
                <p className="text-[11px] text-muted-foreground">
                  Cloisonnement projets, tâches &amp; finances
                </p>
              </div>
            </div>
            <select
              value={activeWorkspace}
              onChange={(e) => setActiveWorkspace(e.target.value)}
              aria-label="Sélectionner l'espace de travail"
              className="h-9 rounded-lg border border-input bg-secondary/60 px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Personnel">Personnel</option>
              <option value="Entreprise">Entreprise</option>
            </select>
          </div>
        </Card>
      </div>

      {/* 3. Apparence & Thèmes Apple (Compact Grouped List) */}
      <div className="space-y-1.5">
        <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Apparence
        </h3>
        <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
          {/* Style Apple : Cupertino vs Sonoma */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Palette className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Style</span>
            </div>

            <div
              role="radiogroup"
              aria-label="Style visuel Apple"
              className="inline-flex rounded-xl bg-muted p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={themePreset === "cupertino"}
                onClick={() => setThemePreset("cupertino")}
                className={`apple-press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium min-h-[34px] ${
                  themePreset === "cupertino"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#007AFF] dark:bg-[#0A84FF]" />
                Cupertino
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={themePreset === "sonoma"}
                onClick={() => setThemePreset("sonoma")}
                className={`apple-press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium min-h-[34px] ${
                  themePreset === "sonoma"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#0D9488] dark:bg-[#2DD4BF]" />
                Sonoma
              </button>
            </div>
          </div>

          {/* Mode : Clair / Sombre / Auto */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <Sun className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Mode</span>
            </div>

            <div
              role="radiogroup"
              aria-label="Mode d'affichage"
              className="inline-flex rounded-xl bg-muted p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === "light"}
                onClick={() => setTheme("light")}
                className={`apple-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium min-h-[34px] ${
                  theme === "light"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                Clair
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === "dark"}
                onClick={() => setTheme("dark")}
                className={`apple-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium min-h-[34px] ${
                  theme === "dark"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                Sombre
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === "system"}
                onClick={() => setTheme("system")}
                className={`apple-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium min-h-[34px] ${
                  theme === "system"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                Auto
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Préférences générales */}
      <div className="space-y-1.5">
        <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Préférences
        </h3>
        <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--idea)]/15 text-[var(--idea)]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  Rappels d&apos;échéances et tâches
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label="Activer les notifications"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ${
                notificationsEnabled ? "bg-[var(--finance)]" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--finance)]/15 text-[var(--finance)]">
                <Coins className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Devise</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Sélectionner la devise"
              className="h-9 rounded-lg border border-input bg-secondary/60 px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring tabular-nums"
            >
              <option value="EUR (€)">EUR (€)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="XOF (CFA)">XOF (CFA)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Données de démonstration
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 text-xs"
            >
              {resetDone ? "Réinitialisé ✓" : "Réinitialiser"}
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. Session / Déconnexion */}
      <Card className="apple-surface border-border/80 bg-card p-0 overflow-hidden">
        <button
          type="button"
          onClick={onLogout}
          className="apple-press flex w-full items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] text-sm font-semibold text-destructive hover:bg-destructive/8"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </Card>
    </div>
  );
};
