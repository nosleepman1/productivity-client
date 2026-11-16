import { useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCreanceRelance } from "@/features/finances/hooks/useCreances";
import { toast } from "@/store/toast.store";
import type { Creance } from "@/types/finances";

/** Propriétés de la modale de relance WhatsApp pour une créance. */
export interface RelanceModalProps {
  /** Contrôle l'affichage de la modale. */
  open: boolean;
  /** Identifiant de l'espace actif. */
  espaceId: string | null;
  /** Créance sélectionnée à relancer. */
  creance: Creance | null;
  /** Ferme la modale. */
  onClose: () => void;
}

/**
 * Modale Apple-style pour prévisualiser, copier ou ouvrir le message de relance
 * WhatsApp généré par le backend (`GET /creances/:id/relance`).
 */
export function RelanceModal({
  open,
  espaceId,
  creance,
  onClose,
}: RelanceModalProps) {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError } = useCreanceRelance(
    open ? espaceId : null,
    open && creance ? creance.id : null,
  );

  const handleCopy = async () => {
    if (!data?.message) return;
    try {
      await navigator.clipboard.writeText(data.message);
      setCopied(true);
      toast.success("Message copié", "Prêt à être collé dans WhatsApp ou SMS.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible", "Votre navigateur a bloqué le presse-papier.");
    }
  };

  return (
    <AnimatePresence>
      {open && creance && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="relance-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="apple-surface relative z-10 w-full max-w-md rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="relance-modal-title"
                    className="text-base font-semibold text-[var(--text-primary)]"
                  >
                    Relance WhatsApp
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {creance.contact?.nom ?? creance.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="apple-press flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="h-32 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" />
              ) : isError || !data ? (
                <p className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-500">
                  Impossible de générer le message de relance. Vérifiez qu'un
                  contact avec numéro de téléphone est associé.
                </p>
              ) : (
                <>
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 text-sm leading-relaxed whitespace-pre-line text-[var(--text-primary)]">
                    {data.message}
                  </div>
                  {data.telephone && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      Destinataire : <strong>{data.telephone}</strong>
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copier le texte
                        </>
                      )}
                    </button>

                    <a
                      href={data.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ouvrir WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
