import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { getAppLanguage, setAppLanguage } from "@/i18n";
import type { LangueProfil } from "@/types/auth";
import { useAuthStore } from "@/store/auth.store";
import {
  useProfil,
  useUpdateProfilMutation,
} from "@/features/auth/hooks/useProfil";
import { useSessions } from "@/features/auth/hooks/useAuth";
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications";
import { ProfilEditModal } from "@/features/auth/components/ProfilEditModal";
import { SessionsModal } from "@/features/auth/components/SessionsModal";
import {
  useActiveEspace,
  useSwitchEspace,
} from "@/features/espaces/hooks/useEspaces";
import { EspaceFormModal } from "@/features/espaces/components/EspaceFormModal";
import { buildIcsFeedUrl } from "@/features/productivity/utils/calendar";
import { SubscriptionSection } from "@/features/subscriptions/components/SubscriptionSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Laptop,
  Globe,
  Palette,
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  LogOut,
  RotateCcw,
  Check,
  Plus,
  Send,
  Shield,
  SlidersHorizontal,
  Smartphone,
  User,
} from "lucide-react";

export type ParametresSubTab =
  | "compte"
  | "abonnement"
  | "apparence"
  | "preferences";

interface ParametresViewProps {
  activeSubTab?: ParametresSubTab;
  onSubTabChange?: (tab: ParametresSubTab) => void;
  onResetData?: () => void;
  onLogout?: () => void;
  onOpenOnboarding?: () => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({
  activeSubTab: controlledSubTab,
  onSubTabChange,
  onResetData,
  onLogout,
  onOpenOnboarding,
}) => {
  const { t } = useTranslation();
  const { theme, setTheme, themePreset, setThemePreset } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { data: profil } = useProfil();
  const push = usePushNotifications();
  const updateProfilMutation = useUpdateProfilMutation();
  const currentLang = (profil?.langue ?? getAppLanguage()) as LangueProfil;

  const [localSubTab, setLocalSubTab] = useState<ParametresSubTab>("compte");
  const activeSubTab = controlledSubTab ?? localSubTab;
  const setSubTab = (tab: ParametresSubTab) => {
    setLocalSubTab(tab);
    onSubTabChange?.(tab);
  };

  const handleSelectLanguage = (lang: LangueProfil) => {
    setAppLanguage(lang);
    updateProfilMutation.mutate({ langue: lang });
  };
  const { data: sessions = [] } = useSessions();
  const { espaces, activeEspaceId, isLoading: espacesLoading } =
    useActiveEspace();
  const switchEspace = useSwitchEspace();

  const [icsCopied, setIcsCopied] = useState(false);
  const [isCreateEspaceOpen, setIsCreateEspaceOpen] = useState(false);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const notificationsEnabled = profil?.notifications ?? true;
  const icsFeedUrl = buildIcsFeedUrl(profil?.calendrierToken);

  const handleCopyIcs = async () => {
    if (!icsFeedUrl) return;
    try {
      await navigator.clipboard.writeText(icsFeedUrl);
      setIcsCopied(true);
      setTimeout(() => setIcsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const initials = (user?.name ?? "AD")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleReset = () => {
    onResetData?.();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  const tabs: Array<{
    id: ParametresSubTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "compte", label: "Compte", icon: <User className="h-3.5 w-3.5" /> },
    {
      id: "abonnement",
      label: "Abonnement",
      icon: <Crown className="h-3.5 w-3.5" />,
    },
    {
      id: "apparence",
      label: "Apparence",
      icon: <Palette className="h-3.5 w-3.5" />,
    },
    {
      id: "preferences",
      label: "Préférences",
      icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Navigation segmentée compacte pour gagner de l'espace */}
      <div
        role="tablist"
        aria-label="Sections des paramètres"
        className="grid grid-cols-4 gap-1 rounded-2xl border border-border/80 bg-muted/60 p-1"
      >
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSubTab(tab.id)}
              className={`apple-press flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ONGLET 1 : COMPTE & ESPACES */}
      {activeSubTab === "compte" && (
        <div className="space-y-4">
          <Card className="apple-surface border-border/80 bg-card p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsProfilOpen(true)}
              className="apple-press flex w-full items-center justify-between gap-3 p-4 min-h-[68px] text-left hover:bg-muted/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {initials || "AD"}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground sm:text-base">
                    {user?.name ?? t("parametres.userFallback")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {user?.email ?? t("parametres.activeSession")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
            </button>
          </Card>

          {/* Espace de travail */}
          <div className="space-y-1.5">
            <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("parametres.workspaceSection")}
            </h3>
            <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("parametres.activeWorkspace")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("parametres.workspaceHint")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeEspaceId ?? ""}
                    disabled={espacesLoading || espaces.length === 0}
                    onChange={(e) => switchEspace(e.target.value)}
                    aria-label={t("parametres.activeWorkspace")}
                    className="h-9 max-w-[145px] truncate rounded-lg border border-input bg-secondary/60 px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    {espaces.length === 0 ? (
                      <option value="">
                        {espacesLoading
                          ? t("common.loading")
                          : t("parametres.noWorkspace")}
                      </option>
                    ) : (
                      espaces.map((esp) => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nom}
                        </option>
                      ))
                    )}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("parametres.workspaceSection")}
                    onClick={() => setIsCreateEspaceOpen(true)}
                    className="apple-press h-9 w-9 shrink-0 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSessionsOpen(true)}
                className="apple-press flex w-full items-center justify-between gap-3 px-4 py-3 min-h-[52px] text-left hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("parametres.sessionsTitle")}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {sessions.length > 0
                        ? t("parametres.sessionsCount", {
                            count: sessions.length,
                          })
                        : t("parametres.sessionsManage")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              </button>
            </Card>
          </div>

          <Card className="apple-surface border-border/80 bg-card p-0 overflow-hidden">
            <button
              type="button"
              onClick={onLogout}
              className="apple-press flex w-full items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] text-sm font-semibold text-destructive hover:bg-destructive/8"
            >
              <LogOut className="h-4 w-4" />
              {t("parametres.logoutBtn")}
            </button>
          </Card>
        </div>
      )}

      {/* ONGLET 2 : ABONNEMENT & PAIEMENTS */}
      {activeSubTab === "abonnement" && <SubscriptionSection />}

      {/* ONGLET 3 : APPARENCE & LANGUE */}
      {activeSubTab === "apparence" && (
        <div className="space-y-1.5">
          <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("parametres.appearanceSection")}
          </h3>
          <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
            {/* Style Apple : Cupertino vs Sonoma */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Palette className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("parametres.styleLabel")}
                </span>
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
                <span className="text-sm font-medium text-foreground">
                  {t("parametres.modeLabel")}
                </span>
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
                  {t("parametres.themes.clair")}
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
                  {t("parametres.themes.sombre")}
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
                  {t("parametres.themes.systeme")}
                </button>
              </div>
            </div>

            {/* Langue : Français / English / العربية / Wolof */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("parametres.languageLabel")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("parametres.languageHint")}
                  </p>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label={t("parametres.languageLabel")}
                className="inline-flex flex-wrap rounded-xl bg-muted p-1 gap-0.5"
              >
                {(
                  [
                    { id: "fr", label: "Français" },
                    { id: "en", label: "English" },
                    { id: "ar", label: "العربية" },
                    { id: "wo", label: "Wolof" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={currentLang === item.id}
                    onClick={() => handleSelectLanguage(item.id)}
                    className={`apple-press rounded-lg px-2.5 py-1.5 text-xs font-medium min-h-[34px] ${
                      currentLang === item.id
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ONGLET 4 : PRÉFÉRENCES, NOTIFS, RYTHME & AGENDA */}
      {activeSubTab === "preferences" && (
        <div className="space-y-1.5">
          <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("parametres.preferencesSection")}
          </h3>
          <Card className="apple-surface border-border/80 bg-card divide-y divide-border/70 p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--idea)]/15 text-[var(--idea)]">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("parametres.notificationsTitle")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("parametres.notificationsHint")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label="Activer les notifications"
                disabled={updateProfilMutation.isPending}
                onClick={() =>
                  updateProfilMutation.mutate({
                    notifications: !notificationsEnabled,
                  })
                }
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

            {/* Notifications Push PWA (appareil courant) */}
            <div className="space-y-2.5 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t("parametres.pushTitle")}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {!push.isSecureContext
                        ? t("parametres.pushHttpsRequired")
                        : !push.isSupported
                          ? t("parametres.pushUnsupported")
                          : push.isSubscribed
                            ? t("parametres.pushActiveCount", {
                                count: push.subscriptionCount,
                              })
                            : t("parametres.pushInactiveHint")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={push.isSubscribed}
                  aria-label="Activer les notifications Push PWA"
                  disabled={
                    push.isPending ||
                    !push.isSupported ||
                    !push.isSecureContext ||
                    !push.serverConfigured
                  }
                  onClick={() =>
                    push.isSubscribed ? push.disable() : push.enable()
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                    push.isSubscribed ? "bg-indigo-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                      push.isSubscribed ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {push.isSubscribed && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={push.isPending}
                  onClick={() => push.sendTest()}
                  className="apple-press h-9 w-full rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("parametres.sendTestNotif")}
                </Button>
              )}
            </div>

            {/* Rythme de vie & Heures de notifications */}
            <div className="space-y-3 px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("parametres.rhythmTitle")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("parametres.rhythmHint")}
                    </p>
                  </div>
                </div>
                {onOpenOnboarding && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenOnboarding}
                    className="h-8 rounded-xl text-[11px] font-semibold gap-1.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {t("parametres.configureBtn")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="flex flex-col gap-1 rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("parametres.wakeUp")}
                  </span>
                  <input
                    type="time"
                    value={profil?.heureLever ?? "07:30"}
                    onChange={(e) =>
                      updateProfilMutation.mutate({ heureLever: e.target.value })
                    }
                    className="bg-transparent text-xs font-bold text-foreground outline-none tabular-nums"
                  />
                </label>

                <label className="flex flex-col gap-1 rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("parametres.workEnd")}
                  </span>
                  <input
                    type="time"
                    value={profil?.heureDescente ?? "18:00"}
                    onChange={(e) =>
                      updateProfilMutation.mutate({
                        heureDescente: e.target.value,
                      })
                    }
                    className="bg-transparent text-xs font-bold text-foreground outline-none tabular-nums"
                  />
                </label>

                <label className="flex flex-col gap-1 rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("parametres.bedtime")}
                  </span>
                  <input
                    type="time"
                    value={profil?.heureCoucher ?? "22:30"}
                    onChange={(e) =>
                      updateProfilMutation.mutate({
                        heureCoucher: e.target.value,
                      })
                    }
                    className="bg-transparent text-xs font-bold text-foreground outline-none tabular-nums"
                  />
                </label>
              </div>
            </div>

            {/* Synchronisation Agenda (.ics Google Calendar / Apple Calendrier) */}
            <div className="space-y-2.5 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t("parametres.calendarTitle")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("parametres.calendarHint")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!icsFeedUrl}
                  onClick={handleCopyIcs}
                  className="h-8 shrink-0 rounded-xl text-xs font-semibold gap-1.5"
                >
                  {icsCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      {t("parametres.copiedFeed")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t("parametres.copyFeed")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 min-h-[52px]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("parametres.demoData")}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-9 text-xs gap-1.5"
              >
                {resetDone ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--finance)]" />
                    {t("parametres.resetDone")}
                  </>
                ) : (
                  t("parametres.resetBtn")
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <EspaceFormModal
        open={isCreateEspaceOpen}
        onOpenChange={setIsCreateEspaceOpen}
      />
      <ProfilEditModal open={isProfilOpen} onOpenChange={setIsProfilOpen} />
      <SessionsModal open={isSessionsOpen} onOpenChange={setIsSessionsOpen} />
    </div>
  );
};
