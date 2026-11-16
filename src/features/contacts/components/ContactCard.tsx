import { Mail, Pencil, Phone, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { CONTACT_TYPE_LABELS } from "@/features/contacts/schemas/contact.schema";
import type { Contact, ContactType } from "@/types/contacts";

/** Propriétés d'une carte de contact. */
export interface ContactCardProps {
  /** Entité contact retournée par l'API. */
  contact: Contact;
  /** Index pour l'animation échelonnée. */
  index?: number;
  /** Ouvre la modale d'édition. */
  onEdit: (contact: Contact) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (contact: Contact) => void;
}

const TYPE_STYLES: Record<ContactType, string> = {
  CLIENT: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  FOURNISSEUR: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  PARTENAIRE: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  AUTRE: "bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
};

/**
 * Carte Apple-style animée représentant un contact du carnet de l'utilisateur.
 */
export function ContactCard({
  contact,
  index = 0,
  onEdit,
  onDelete,
}: ContactCardProps) {
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
      whileHover={{ y: -2 }}
      className="apple-surface flex flex-col justify-between rounded-3xl p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
                {contact.nom}
              </h3>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[contact.type]}`}
              >
                {CONTACT_TYPE_LABELS[contact.type]}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(contact)}
              aria-label={`Modifier ${contact.nom}`}
              className="apple-press flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(contact)}
              aria-label={`Supprimer ${contact.nom}`}
              className="apple-press flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-rose-500/12 hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)]">
          {contact.telephone && (
            <p className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="tabular-nums">{contact.telephone}</span>
            </p>
          )}
          {contact.email && (
            <p className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </p>
          )}
          {contact.notes && (
            <p className="line-clamp-2 pt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {contact.notes}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
