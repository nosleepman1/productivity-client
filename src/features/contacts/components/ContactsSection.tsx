import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  useContacts,
  useCreateContactMutation,
  useDeleteContactMutation,
  useUpdateContactMutation,
} from "@/features/contacts/hooks/useContacts";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
} from "@/features/contacts/schemas/contact.schema";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import type { Contact, ContactType, CreateContactDto } from "@/types/contacts";
import { ContactFormModal } from "./ContactFormModal";
import { ContactList } from "./ContactList";

/** Propriétés de la section Carnet de Contacts. */
export interface ContactsSectionProps {
  /** Contrôle externe optionnel d'ouverture de la modale de création. */
  createOpenSignal?: number;
}

/**
 * Section complète de gestion du carnet de contacts (recherche serveur,
 * filtre par catégorie, pagination et CRUD complet avec validation Zod).
 */
export function ContactsSection({ createOpenSignal = 0 }: ContactsSectionProps) {
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | "">("");

  const [formModal, setFormModal] = useState<{
    open: boolean;
    item: Contact | null;
  }>({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [lastSignal, setLastSignal] = useState(createOpenSignal);

  if (createOpenSignal !== lastSignal) {
    setLastSignal(createOpenSignal);
    if (createOpenSignal > 0) {
      setFormModal({ open: true, item: null });
    }
  }

  const contactsQuery = useContacts({
    page,
    limit: 20,
    tri: "nom",
    ordre: "asc",
    ...(recherche.trim() ? { recherche: recherche.trim() } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  });

  const createContact = useCreateContactMutation();
  const updateContact = useUpdateContactMutation();
  const deleteContact = useDeleteContactMutation();

  const handleSubmit = async (dto: CreateContactDto) => {
    if (formModal.item) {
      await updateContact.mutateAsync({ id: formModal.item.id, dto });
    } else {
      await createContact.mutateAsync(dto);
    }
    setFormModal({ open: false, item: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteContact.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const meta = contactsQuery.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres par type */}
      <div className="apple-surface space-y-3 rounded-2xl p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un contact par nom, téléphone ou email..."
            className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("");
              setPage(1);
            }}
            className={`apple-press min-h-[34px] rounded-full px-3 text-xs font-medium transition-colors ${
              typeFilter === ""
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Tous
          </button>
          {CONTACT_TYPES.map((t) => {
            const active = typeFilter === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`apple-press min-h-[34px] rounded-full px-3 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {CONTACT_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs text-[var(--text-secondary)]">
            <span className="tabular-nums">
              Page {meta?.page ?? page} sur {totalPages} · {meta?.total ?? 0}{" "}
              contact{(meta?.total ?? 0) > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Page précédente"
                className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Page suivante"
                className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ContactList
        items={contactsQuery.data?.data ?? []}
        isLoading={contactsQuery.isLoading}
        onCreate={() => setFormModal({ open: true, item: null })}
        onEdit={(item) => setFormModal({ open: true, item })}
        onDelete={(item) => setDeleteTarget(item)}
      />

      <ContactFormModal
        open={formModal.open}
        initialData={formModal.item}
        isPending={createContact.isPending || updateContact.isPending}
        onClose={() => setFormModal({ open: false, item: null })}
        onSubmit={(dto) => void handleSubmit(dto)}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer ce contact ?"
        description={
          deleteTarget
            ? `« ${deleteTarget.nom} » sera retiré de votre carnet de contacts.`
            : ""
        }
        isPending={deleteContact.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
