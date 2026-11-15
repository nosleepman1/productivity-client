import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import { NoteFormModal } from "@/features/productivity/components/NoteFormModal";
import { NoteList } from "@/features/productivity/components/NoteList";
import { NoteReaderModal } from "@/features/productivity/components/NoteReaderModal";
import { ProductivityFiltersBar } from "@/features/productivity/components/ProductivityFiltersBar";
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotes,
  useUpdateNoteMutation,
} from "@/features/productivity/hooks/useNotes";
import type { CreateNoteDto, Note } from "@/types/productivity";

/**
 * Vue Notes & Idées connectée à l'API NestJS (`/espaces/:espaceId/notes`),
 * avec lecture plein écran, édition Zod, recherche et pagination.
 */
export function IdeesView() {
  const { activeEspace, activeEspaceId } = useActiveEspace();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tri, setTri] = useState<"updatedAt" | "createdAt" | "titre">(
    "updatedAt",
  );
  const [ordre, setOrdre] = useState<"asc" | "desc">("desc");

  const [formModal, setFormModal] = useState<{
    open: boolean;
    item: Note | null;
  }>({ open: false, item: null });
  const [readerNote, setReaderNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const notesQuery = useNotes(activeEspaceId, {
    page,
    limit: 30,
    tri,
    ordre,
  });

  const createNote = useCreateNoteMutation(activeEspaceId);
  const updateNote = useUpdateNoteMutation(activeEspaceId);
  const deleteNote = useDeleteNoteMutation(activeEspaceId);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = notesQuery.data?.data ?? [];
    if (!q) return list;
    return list.filter(
      (n) =>
        n.titre.toLowerCase().includes(q) ||
        n.contenu.toLowerCase().includes(q),
    );
  }, [notesQuery.data?.data, search]);

  const handleSubmit = async (dto: CreateNoteDto) => {
    if (formModal.item) {
      await updateNote.mutateAsync({ id: formModal.item.id, dto });
    } else {
      await createNote.mutateAsync(dto);
    }
    setFormModal({ open: false, item: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteNote.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const meta = notesQuery.data?.meta;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6 pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
              <Sparkles className="h-3 w-3" />
              {activeEspace?.nom ?? "Espace actif"}
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Notes & Idées
            </h1>
          </div>

          <button
            type="button"
            disabled={!activeEspaceId}
            onClick={() => setFormModal({ open: true, item: null })}
            className="apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Nouvelle note
          </button>
        </div>

        <ProductivityFiltersBar
          search={search}
          onSearchChange={setSearch}
          tri={tri}
          sortOptions={[
            { value: "updatedAt", label: "Dernière modification" },
            { value: "createdAt", label: "Date de création" },
            { value: "titre", label: "Titre" },
          ]}
          onTriChange={(val) => {
            setTri(val as "updatedAt" | "createdAt" | "titre");
            setPage(1);
          }}
          ordre={ordre}
          onToggleOrdre={() =>
            setOrdre((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          page={meta?.page ?? page}
          totalPages={
            meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1
          }
          totalItems={meta?.total ?? 0}
          onPageChange={setPage}
        />

        <NoteList
          items={filteredNotes}
          isLoading={notesQuery.isLoading}
          onCreate={() => setFormModal({ open: true, item: null })}
          onRead={(note) => setReaderNote(note)}
          onEdit={(item) => setFormModal({ open: true, item })}
          onDelete={(item) => setDeleteTarget(item)}
        />

        <NoteFormModal
          open={formModal.open}
          initialData={formModal.item}
          isPending={createNote.isPending || updateNote.isPending}
          onClose={() => setFormModal({ open: false, item: null })}
          onSubmit={(dto) => void handleSubmit(dto)}
        />

        <NoteReaderModal
          note={readerNote}
          onClose={() => setReaderNote(null)}
          onEdit={(note) => setFormModal({ open: true, item: note })}
        />

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title="Supprimer cette note ?"
          description={
            deleteTarget
              ? `« ${deleteTarget.titre} » sera définitivement supprimée.`
              : ""
          }
          isPending={deleteNote.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </MotionConfig>
  );
}
