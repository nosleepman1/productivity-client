import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Palette,
  Shield,
  Bell,
  Coins,
} from "lucide-react";

interface ParametresViewProps {
  onResetData?: () => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({ onResetData }) => {
  const { theme, setTheme, resolvedTheme, themePreset, setThemePreset } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState("EUR (€)");
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    onResetData?.();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in-50 duration-300">
      {/* 1. Profile Banner */}
      <Card className="border-border/80 bg-gradient-to-r from-card to-primary/5 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-base font-bold text-white shadow-md shadow-primary/25">
              AD
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                Abdallah DIOUF
              </h2>
              <p className="text-xs text-muted-foreground">Product Lead & Developer</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Édition Pro
                </span>
                <span className="text-[10px] text-muted-foreground">• Espace Actif</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. THEME PRESET & MODE SELECTOR SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Thème Apple &amp; Apparence
            </h3>
            <p className="text-xs text-muted-foreground">
              Deux systèmes visuels ergonomiques inspirés d&apos;Apple HIG.
            </p>
          </div>
          <span className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground tabular-nums">
            {themePreset === "cupertino" ? "Cupertino" : "Sonoma"} ·{" "}
            {theme === "system" ? `Système (${resolvedTheme})` : theme === "light" ? "Clair" : "Sombre"}
          </span>
        </div>

        {/* 2.1 Apple Theme Presets */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setThemePreset("cupertino")}
            className={`apple-press group relative flex flex-col rounded-2xl border p-4 text-left ${
              themePreset === "cupertino"
                ? "border-primary bg-primary/5 ring-2 ring-primary/35 apple-surface"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Cupertino Paper &amp; Ink
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Style Apple Notes · Clarté &amp; contraste pur
                </span>
              </div>
              {themePreset === "cupertino" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#1c1c1e] p-2.5">
              <span className="h-5 w-5 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#34C759] dark:bg-[#30D158] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#5856D6] dark:bg-[#5E5CE6] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#FF9500] dark:bg-[#FF9F0A] shadow-xs" />
              <span className="ml-auto text-[10px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                SF Blue
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setThemePreset("sonoma")}
            className={`apple-press group relative flex flex-col rounded-2xl border p-4 text-left ${
              themePreset === "sonoma"
                ? "border-primary bg-primary/5 ring-2 ring-primary/35 apple-surface"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Sonoma Frosted Glass
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Style macOS Focus · Verre dépoli &amp; Teal
                </span>
              </div>
              {themePreset === "sonoma" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#f2f4f8] dark:bg-[#161922] p-2.5">
              <span className="h-5 w-5 rounded-full bg-[#0D9488] dark:bg-[#38BDF8] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#10B981] dark:bg-[#34D399] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#3B82F6] dark:bg-[#60A5FA] shadow-xs" />
              <span className="h-5 w-5 rounded-full bg-[#F59E0B] dark:bg-[#FBBF24] shadow-xs" />
              <span className="ml-auto text-[10px] font-semibold text-slate-800 dark:text-slate-100">
                Focus Teal
              </span>
            </div>
          </button>
        </div>

        {/* 3 Visual Cards for Mode Picking */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`group relative flex flex-col rounded-xl border p-3.5 text-left transition-all ${
              theme === "light"
                ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground">Clair</span>
              </div>
              {theme === "light" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Miniature Preview Mockup */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="h-2 w-12 rounded bg-indigo-600" />
                <div className="h-2 w-4 rounded bg-emerald-500" />
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 space-y-1">
                <div className="h-1.5 w-16 rounded bg-slate-800" />
                <div className="h-1 w-10 rounded bg-slate-400" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Lisibilité maximale et tons doux pour le travail de jour.
            </p>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`group relative flex flex-col rounded-xl border p-3.5 text-left transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-foreground">Sombre</span>
              </div>
              {theme === "dark" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Miniature Preview Mockup */}
            <div className="rounded-lg border border-slate-800 bg-[#0c0e17] p-2 shadow-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="h-2 w-12 rounded bg-indigo-500" />
                <div className="h-2 w-4 rounded bg-emerald-400" />
              </div>
              <div className="rounded bg-[#151928] p-1.5 border border-slate-700/60 space-y-1">
                <div className="h-1.5 w-16 rounded bg-slate-100" />
                <div className="h-1 w-10 rounded bg-slate-500" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Obsidian profond, contraste optimal &amp; accents néons.
            </p>
          </button>

          {/* System Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`group relative flex flex-col rounded-xl border p-3.5 text-left transition-all ${
              theme === "system"
                ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Système</span>
              </div>
              {theme === "system" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Miniature Preview Split Mockup */}
            <div className="flex rounded-lg overflow-hidden border border-border shadow-xs h-[52px]">
              <div className="w-1/2 bg-slate-100 p-1.5 flex flex-col justify-center gap-1">
                <div className="h-2 w-8 rounded bg-indigo-600" />
                <div className="h-1.5 w-6 rounded bg-slate-300" />
              </div>
              <div className="w-1/2 bg-[#0c0e17] p-1.5 flex flex-col justify-center gap-1">
                <div className="h-2 w-8 rounded bg-indigo-400" />
                <div className="h-1.5 w-6 rounded bg-slate-600" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Bascule automatique selon les préférences de votre appareil.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Productivity Color Tokens Showcase */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nuancier & Accents Métier
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Chaque domaine dispose d&apos;une signature visuelle distincte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-2">
              <span className="h-4 w-4 rounded-full bg-primary shadow-xs ring-2 ring-primary/20" />
              <div className="text-[11px]">
                <p className="font-semibold text-foreground">Primary</p>
                <p className="text-muted-foreground">Indigo / Core</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-2">
              <span className="h-4 w-4 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-500/20" />
              <div className="text-[11px]">
                <p className="font-semibold text-foreground">Finance</p>
                <p className="text-muted-foreground">Émeraude / Cash</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-2">
              <span className="h-4 w-4 rounded-full bg-indigo-500 shadow-xs ring-2 ring-indigo-500/20" />
              <div className="text-[11px]">
                <p className="font-semibold text-foreground">Projets</p>
                <p className="text-muted-foreground">Violet / Sprints</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-2">
              <span className="h-4 w-4 rounded-full bg-amber-500 shadow-xs ring-2 ring-amber-500/20" />
              <div className="text-[11px]">
                <p className="font-semibold text-foreground">Idées</p>
                <p className="text-muted-foreground">Or / Brainstorm</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. General Preferences */}
      <Card className="border-border/80 bg-card shadow-xs divide-y divide-border/60">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Notifications & Rappels</p>
              <p className="text-[11px] text-muted-foreground">
                Alertes d&apos;échéances et récapitulatif quotidien
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              notificationsEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                notificationsEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Devise principale</p>
              <p className="text-[11px] text-muted-foreground">Affichage des montants financiers</p>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none"
          >
            <option value="EUR (€)">EUR (€)</option>
            <option value="USD ($)">USD ($)</option>
            <option value="XOF (CFA)">XOF (CFA)</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Données & Réinitialisation</p>
              <p className="text-[11px] text-muted-foreground">
                Recharger les données de démonstration
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={handleReset}
            className="text-xs"
          >
            {resetDone ? "Réinitialisé ✓" : "Réinitialiser"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
