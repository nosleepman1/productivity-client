import { Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FinanceListSkeleton } from "@/features/finances/components/FinanceSkeletons";
import type { Contact } from "@/types/contacts";
import { ContactCard } from "./ContactCard";

/** Propriétés de la liste des contacts. */
export interface ContactListProps {
  /** Contacts retournés par l'API. */
  items: Contact[];
  /** Indique le chargement initial. */
  isLoading: boolean;
  /** Ouvre la modale de création. */
  onCreate: () => void;
  /** Ouvre la modale d'édition. */
  onEdit: (contact: Contact) => void;
  /** Ouvre la confirmation de suppression. */
  onDelete: (contact: Contact) => void;
}

/**
 * Grille responsive animée des contacts avec état vide et squelette de chargement.
 */
export function ContactList({
  items,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}: ContactListProps) {
  if (isLoading) {
    return <FinanceListSkeleton count={4} />;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          Aucun contact trouvé
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          Ajoutez vos clients, fournisseurs et partenaires pour les associer à
          vos dettes et créances WhatsApp.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="apple-press mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouveau contact
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {items.map((contact, idx) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            index={idx}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
