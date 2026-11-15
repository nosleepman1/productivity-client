import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import {
  computeProgressPercent,
  formatDateUtc,
  formatFcfa,
} from "@/features/finances/utils/format";
import type { Creance, Dette, StatutSuivi } from "@/types/finances";

/** Propriétés d'une carte de suivi (dette ou créance). */
export interface SuiviCardProps {
  /** Nature du dossier : dette (à payer) ou créance (à recevoir). */
  kind: "dette" | "creance";
  /** Entité dette ou créance. */
  item: Dette | Creance;
  /** Index pour l'animation échelonnée. */
  index?: number;
  /** Ouvre le tiroir des paiements. */
  onOpenPaiements: (item: Dette | Creance) => void;
  /** Ouvre la modale de relance WhatsApp (uniquement pour les créances). */
  onOpenRelance?: (item: Creance) => void;
  /** Ouvre le formulaire d'édition. */
  onEdit: (item: Dette | Creance) => void;
  /** Ouvre le dialogue de confirmation de suppression. */
  onDelete: (item: Dette | Creance) => void;
}

const STATUT_STYLES: Record<
  StatutSuivi,
  { label: string; className: string }
> = {
  EN_COURS: {
    label: "En cours",
    className: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  },
  EN_RETARD: {
    label: "En retard",
    className: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  },
  SOLDEE: {
    label: "Soldée",
    className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
};

/**
 * Carte Apple-style animée pour une dette ou une créance avec jauge de progression,
 * badge de statut, contact associé et actions rapides.
 */
export function SuiviCard({
  kind,
  item,
  index = 0,
  onOpenPaiements,
  onOpenRelance,
  onEdit,
  onDelete,
}: SuiviCardProps) {
  const progress = computeProgressPercent(item.montantPaye, item.montant);
  const statutMeta = STATUT_STYLES[item.statut];
  const isSoldee = item.statut === "SOLDEE";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 28,
        delay: Math.min(index * 0.04, 0.2),
      }}
      className="apple-surface rounded-3xl p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statutMeta.className}`}
            >
              {isSoldee && <CheckCircle2 className="h-3 w-3" />}
              {statutMeta.label}
            </span>

            {item.contact && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                <User className="h-3 w-3" />
                {item.contact.nom}
              </span>
            )}
          </div>

          <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
            {item.description}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
            <span>Créée le {formatDateUtc(item.date)}</span>
            {item.datePromise && (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Échéance : {formatDateUtc(item.datePromise)}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
            {formatFcfa(item.reste)}
          </p>
          <p className="text-xs tabular-nums text-[var(--text-secondary)]">
            restant sur {formatFcfa(item.montant)}
          </p>
        </div>
      </div>

      {/* Barre de progression animée */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="tabular-nums">
            {kind === "dette" ? "Remboursé" : "Encaissé"} :{" "}
            <strong className="text-[var(--text-primary)]">
              {formatFcfa(item.montantPaye)}
            </strong>
          </span>
          <span className="font-semibold tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${
              isSoldee
                ? "bg-emerald-500"
                : item.statut === "EN_RETARD"
                  ? "bg-rose-500"
                  : "bg-[var(--accent)]"
            }`}
          />
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenPaiements(item)}
            className="apple-press inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[var(--accent)]/12 px-3.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {isSoldee ? "Voir paiements" : "Paiements"}
          </button>

          {kind === "creance" && onOpenRelance && !isSoldee && (
            <button
              type="button"
              onClick={() => onOpenRelance(item as Creance)}
              className="apple-press inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-500/12 px-3.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Relancer WhatsApp
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Modifier ${item.description}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Supprimer ${item.description}`}
            className="apple-press flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
