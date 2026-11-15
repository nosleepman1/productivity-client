import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ThemePreset = "cupertino" | "sonoma";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  themePreset: ThemePreset;
  setTheme: (theme: Theme) => void;
  setThemePreset: (preset: ThemePreset) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "productivity-app-theme";
const PRESET_STORAGE_KEY = "productivity-app-theme-preset";

const THEME_COLORS: Record<ThemePreset, { light: string; dark: string }> = {
  cupertino: { light: "#f5f5f7", dark: "#000000" },
  sonoma: { light: "#f2f4f8", dark: "#0b0d12" },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    }
    return "system";
  });

  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PRESET_STORAGE_KEY) as ThemePreset | null;
      if (saved === "cupertino" || saved === "sonoma") {
        return saved;
      }
    }
    return "cupertino";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.themePreset = themePreset;

    const applyTheme = (currentTheme: Theme) => {
      const active: "light" | "dark" =
        currentTheme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : currentTheme;

      setResolvedTheme(active);
      root.classList.toggle("dark", active === "dark");

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", THEME_COLORS[themePreset][active]);
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme, themePreset]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  const setThemePreset = (preset: ThemePreset) => {
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
    setThemePresetState(preset);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        themePreset,
        setTheme,
        setThemePreset,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
