import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useActiveEspace,
  useSwitchEspace,
} from "@/features/espaces/hooks/useEspaces";
import { useInAppNotifications } from "@/features/notifications/hooks/useInAppNotifications";
import {
  Sun,
  Moon,
  Bell,
  Wallet,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";
import type { NavTab } from "@/components/layout/BottomNav";

/**
 * Propriétés de l'en-tête principal de l'application.
 */
interface HeaderProps {
  /** Onglet racine actuellement actif. */
  activeTab: NavTab;
  /** Sous-section contextuelle optionnelle (ex. Dépenses, Tâches, Notes). */
  subTitle?: string;
  /** Ouvre le tiroir de notifications in-app. */
  onOpenNotifications?: () => void;
}

const TAB_META: Record<
  NavTab,
  { titleKey: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  dashboard: { titleKey: "nav.dashboard", Icon: LayoutDashboard },
  finance: { titleKey: "nav.finance", Icon: Wallet },
  projets: { titleKey: "nav.projets", Icon: FolderKanban },
  parametres: { titleKey: "nav.parametres", Icon: Settings },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  subTitle,
  onOpenNotifications,
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const { activeEspace, espaces } = useActiveEspace();
  const switchEspace = useSwitchEspace();
  const { data: notifData } = useInAppNotifications();
  const [espaceMenuOpen, setEspaceMenuOpen] = useState(false);

  const nonLues = notifData?.nonLues ?? 0;
  const { titleKey, Icon } = TAB_META[activeTab];
  const title = t(titleKey);

  return (
    <header className="apple-glass-bar relative z-30 w-full shrink-0 border-b pt-[calc(env(safe-area-inset-top)+0.35rem)] transition-colors duration-200">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {subTitle && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary truncate">
              {subTitle}
            </span>
          )}
          {activeEspace && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEspaceMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground max-w-[140px] transition-colors"
                title="Changer d'espace de travail"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  style={
                    activeEspace.couleur
                      ? { backgroundColor: activeEspace.couleur }
                      : undefined
                  }
                />
                <span className="truncate">{activeEspace.nom}</span>
                {espaces.length > 1 && (
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
                )}
              </button>

              {espaceMenuOpen && espaces.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setEspaceMenuOpen(false)}
                  />
                  <div className="absolute start-0 top-full z-50 mt-1.5 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Espaces de travail
                    </p>
                    {espaces.map((esp) => {
                      const isCurrent = esp.id === activeEspace.id;
                      return (
                        <button
                          key={esp.id}
                          type="button"
                          onClick={() => {
                            switchEspace(esp.id);
                            setEspaceMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                            isCurrent
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-primary"
                              style={
                                esp.couleur
                                  ? { backgroundColor: esp.couleur }
                                  : undefined
                              }
                            />
                            <span className="truncate">{esp.nom}</span>
                          </span>
                          {isCurrent && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            title={`Mode actuel : ${
              theme === "system" ? `Système (${resolvedTheme})` : theme
            }`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="apple-press relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {nonLues > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {nonLues > 9 ? "9+" : nonLues}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
