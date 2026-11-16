import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { LangueProfil } from "@/types/auth";
import { ar } from "./locales/ar";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { wo } from "./locales/wo";

export const APP_LANG_STORAGE_KEY = "app_lang";
const SUPPORTED: readonly LangueProfil[] = ["fr", "en", "ar", "wo"];

export function normalizeLang(raw?: string | null): LangueProfil {
  if (!raw) return "fr";
  const code = raw.trim().toLowerCase().slice(0, 2);
  if (SUPPORTED.includes(code as LangueProfil)) {
    return code as LangueProfil;
  }
  return "fr";
}

export function applyDocumentDirection(lang: LangueProfil): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function getAppLanguage(): LangueProfil {
  try {
    return normalizeLang(localStorage.getItem(APP_LANG_STORAGE_KEY));
  } catch {
    return "fr";
  }
}

export function setAppLanguage(lang: LangueProfil): void {
  const norm = normalizeLang(lang);
  try {
    localStorage.setItem(APP_LANG_STORAGE_KEY, norm);
  } catch {
    // ignore storage quota/private mode errors
  }
  applyDocumentDirection(norm);
  if (i18n.language !== norm) {
    void i18n.changeLanguage(norm);
  }
}

const initialLang = getAppLanguage();
applyDocumentDirection(initialLang);

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
    wo: { translation: wo },
  },
  lng: initialLang,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(normalizeLang(lng));
});

export default i18n;
