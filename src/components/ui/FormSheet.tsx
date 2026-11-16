import type { ReactNode } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Palette d'accentuation visuelle de l'en-tête d'un formulaire modal.
 */
export type FormSheetAccent =
  | "primary"
  | "emerald"
  | "rose"
  | "amber"
  | "indigo"
  | "slate";

const ACCENT_ICON_CLASSES: Record<FormSheetAccent, string> = {
  primary: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
  emerald: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  rose: "bg-rose-500/12 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
  amber: "bg-amber-500/12 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
  indigo: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
  slate: "bg-slate-500/12 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
};

const SUBMIT_BTN_CLASSES: Record<FormSheetAccent, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
  emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
  rose: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25",
  amber: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
  indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
  slate: "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-slate-500/20",
};

/**
 * Classes CSS unifiées pour les champs `<input>` (`text-base` = 16px afin d'éviter le zoom mobile).
 */
export const FORM_INPUT_CLASS =
  "min-h-[48px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary)]/12";

/**
 * Classes CSS unifiées pour les champs `<select>` (`text-base` = 16px sans zoom mobile).
 */
export const FORM_SELECT_CLASS =
  "min-h-[48px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-base text-[var(--foreground)] outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary)]/12";

/**
 * Classes CSS unifiées pour les zones `<textarea>` (`text-base` = 16px sans zoom mobile).
 */
export const FORM_TEXTAREA_CLASS =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary)]/12";

/**
 * Propriétés du conteneur modal `FormSheet` optimisé mobile & desktop.
 */
export interface FormSheetProps {
  /** Contrôle l'affichage de la feuille/modale. */
  open: boolean;
  /** Identifiant ARIA du titre pour `aria-labelledby`. */
  titleId: string;
  /** Titre affiché dans l'en-tête. */
  title: string;
  /** Sous-titre descriptif optionnel sous le titre. */
  subtitle?: string;
  /** Icône optionnelle affichée dans le badge d'en-tête. */
  icon?: ReactNode;
  /** Accentuation visuelle de l'icône et du thème du formulaire. */
  accent?: FormSheetAccent;
  /** Empêche la fermeture pendant une soumission en cours. */
  isPending?: boolean;
  /** Largeur maximale sur desktop (`md` par défaut, `lg` pour formulaires plus larges). */
  size?: "md" | "lg";
  /** Callback de fermeture. */
  onClose: () => void;
  /** Contenu du formulaire. */
  children: ReactNode;
}

/**
 * Conteneur de formulaire mobile-first (feuille inférieure avec poignée) et centré sur desktop,
 * à surface solide contrastée et défilement interne sûr face au clavier virtuel.
 */
export function FormSheet({
  open,
  titleId,
  title,
  subtitle,
  icon,
  accent = "primary",
  isPending = false,
  size = "md",
  onClose,
  children,
}: FormSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={isPending ? undefined : onClose}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl sm:rounded-3xl",
              size === "lg" ? "sm:max-w-lg" : "sm:max-w-md",
            )}
          >
            {/* Poignée mobile */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-[var(--border)]" />
            </div>

            {/* En-tête solide structuré */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)]/70 px-5 pt-3 pb-4 sm:px-6 sm:pt-5">
              <div className="flex min-w-0 items-center gap-3">
                {icon && (
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      ACCENT_ICON_CLASSES[accent],
                    )}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="truncate text-lg font-bold tracking-tight text-[var(--foreground)]"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="Fermer"
                className="apple-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corps scrollable face au clavier virtuel */}
            <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Propriétés d'un groupe champ de formulaire (`FormField`).
 */
export interface FormFieldProps {
  /** Identifiant HTML du contrôle associé (`htmlFor`). */
  htmlFor?: string;
  /** Libellé lisible du champ. */
  label: string;
  /** Indique si le champ est obligatoire. */
  required?: boolean;
  /** Indication secondaire optionnelle alignée à droite. */
  hint?: string;
  /** Message d'erreur de validation. */
  error?: string;
  /** Contrôle de saisie (`input`, `select`, `textarea`). */
  children: ReactNode;
}

/**
 * Enveloppe de champ avec libellé net, indication optionnelle et message d'erreur accessible.
 */
export function FormField({
  htmlFor,
  label,
  required = false,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="block text-[13px] font-semibold text-[var(--foreground)]/85"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {hint && (
          <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Propriétés de la barre d'actions (`Annuler` + `Soumettre`) d'un formulaire.
 */
export interface FormActionsProps {
  /** Libellé du bouton principal. */
  submitLabel: string;
  /** Libellé affiché pendant la soumission. */
  pendingLabel?: string;
  /** Libellé du bouton d'annulation. */
  cancelLabel?: string;
  /** Indique si la requête est en cours. */
  isPending?: boolean;
  /** Accentuation visuelle du bouton principal. */
  accent?: FormSheetAccent;
  /** Callback d'annulation. */
  onCancel: () => void;
}

/**
 * Pied de formulaire ergonomique avec zones tactiles >= 48px et état de chargement.
 */
export function FormActions({
  submitLabel,
  pendingLabel = "Enregistrement...",
  cancelLabel = "Annuler",
  isPending = false,
  accent = "primary",
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2.5 pt-3 sm:flex-row">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="apple-press inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "apple-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-60",
          SUBMIT_BTN_CLASSES[accent],
        )}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isPending ? pendingLabel : submitLabel}</span>
      </button>
    </div>
  );
}
