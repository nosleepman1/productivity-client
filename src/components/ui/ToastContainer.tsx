import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/toast.store";

const VARIANT_STYLES: Record<
  ToastVariant,
  { Icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  success: { Icon: CheckCircle2, colorClass: "text-[var(--finance)]" },
  error: { Icon: AlertCircle, colorClass: "text-destructive" },
  info: { Icon: Info, colorClass: "text-primary" },
};

/**
 * Conteneur global des notifications toast animées façon Dynamic Island.
 */
export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => {
          const { Icon, colorClass } = VARIANT_STYLES[item.variant];
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="apple-glass-bar apple-surface pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-3.5 py-2.5"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${colorClass}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fermer la notification"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
