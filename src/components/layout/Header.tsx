import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import {
  Sun,
  Moon,
  Bell,
  Wallet,
  FolderKanban,
  Lightbulb,
  Settings,
} from "lucide-react";

interface HeaderProps {
  activeTab: "finance" | "projets" | "idees" | "parametres";
}

const TAB_META: Record<
  HeaderProps["activeTab"],
  { title: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  finance: { title: "Finances", Icon: Wallet },
  projets: { title: "Projets", Icon: FolderKanban },
  idees: { title: "Idées", Icon: Lightbulb },
  parametres: { title: "Réglages", Icon: Settings },
};

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const { activeEspace } = useActiveEspace();
  const { title, Icon } = TAB_META[activeTab];

  return (
    <header className="apple-glass-bar sticky top-0 z-30 w-full border-b transition-colors duration-200">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {activeEspace && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground max-w-[120px] truncate">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                style={
                  activeEspace.couleur
                    ? { backgroundColor: activeEspace.couleur }
                    : undefined
                }
              />
              <span className="truncate">{activeEspace.nom}</span>
            </span>
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
            aria-label="Notifications"
            className="apple-press relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  );
};
