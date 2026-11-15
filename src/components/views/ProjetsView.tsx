import { useMemo, useState } from "react";
import { CheckSquare, FolderKanban, Plus, Sparkles } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import {
  ProductivityFiltersBar,
  type ProductivityStatusFilter,
} from "@/features/productivity/components/ProductivityFiltersBar";
import { ProductivityKpiGrid } from "@/features/productivity/components/ProductivityKpiGrid";
import { ProductivityKpiSkeleton } from "@/features/productivity/components/ProductivitySkeletons";
import { ProjetFormModal } from "@/features/productivity/components/ProjetFormModal";
import { ProjetList } from "@/features/productivity/components/ProjetList";
import { TacheFormModal } from "@/features/productivity/components/TacheFormModal";
import { TacheList } from "@/features/productivity/components/TacheList";
import { TacheProgressRing } from "@/features/productivity/components/TacheProgressRing";
import { useNotes } from "@/features/productivity/hooks/useNotes";
import {
  useCreateProjetMutation,
  useDeleteProjetMutation,
  useProjets,
  useUpdateProjetMutation,
} from "@/features/productivity/hooks/useProjets";
import {
  useCreateTacheMutation,
  useDeleteTacheMutation,
  useTaches,
  useUpdateTacheMutation,
} from "@/features/productivity/hooks/useTaches";
import { getDaysRemainingUtc } from "@/features/productivity/utils/dates";
import type {
  CreateProjetDto,
  CreateTacheDto,
  Projet,
  Tache,
} from "@/types/productivity";

type ProductivityTab = "projets" | "taches";

type DeleteTarget =
  | { kind: "projet"; item: Projet }
  | { kind: "tache"; item: Tache };

/**
 * Vue principale Projets & Tâches connectée à l'API NestJS,
 * isolée par `espaceId` actif et animée avec `motion/react`.
 */
export function ProjetsView() {
  const { activeEspace, activeEspaceId, isLoading: isLoadingEspace } =
    useActiveEspace();

  const [activeTab, setActiveTab] = useState<ProductivityTab>("projets");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ProductivityStatusFilter>("all");
  const [projetTri, setProjetTri] = useState<
    "createdAt" | "dateDebut" | "titre"
  >("createdAt");
  const [tacheTri, setTacheTri] = useState<
    "dateLimite" | "createdAt" | "titre"
  >("dateLimite");
  const [ordre, setOrdre] = useState<"asc" | "desc">("desc");

  const [projetModal, setProjetModal] = useState<{
    open: boolean;
    item: Projet | null;
  }>({ open: false, item: null });
  const [tacheModal, setTacheModal] = useState<{
    open: boolean;
    item: Tache | null;
  }>({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const projetsQuery = useProjets(activeEspaceId, {
    page: activeTab === "projets" ? page : 1,
    limit: 20,
    tri: projetTri,
    ordre,
  });
  const tachesQuery = useTaches(activeEspaceId, {
    page: activeTab === "taches" ? page : 1,
    limit: 50,
    tri: tacheTri,
    ordre: activeTab === "taches" ? ordre : "asc",
  });
  const notesQuery = useNotes(activeEspaceId, { page: 1, limit: 1 });

  const createProjet = useCreateProjetMutation(activeEspaceId);
  const updateProjet = useUpdateProjetMutation(activeEspaceId);
  const deleteProjet = useDeleteProjetMutation(activeEspaceId);

  const createTache = useCreateTacheMutation(activeEspaceId);
  const updateTache = useUpdateTacheMutation(activeEspaceId);
  const deleteTache = useDeleteTacheMutation(activeEspaceId);

  const allProjets = useMemo(
    () => projetsQuery.data?.data ?? [],
    [projetsQuery.data?.data],
  );
  const allTaches = useMemo(
    () => tachesQuery.data?.data ?? [],
    [tachesQuery.data?.data],
  );

  const kpis = useMemo(() => {
    const projetsActifs = allProjets.filter((p) => !p.estTermine).length;
    const tachesTerminees = allTaches.filter((t) => t.estTerminee).length;
    const tachesRestantes = allTaches.length - tachesTerminees;
    const tachesEnRetard = allTaches.filter((t) => {
      if (t.estTerminee) return false;
      const days = getDaysRemainingUtc(t.dateLimite);
      return days !== null && days < 0;
    }).length;

    return {
      projetsActifs,
      projetsTotal: projetsQuery.data?.meta.total ?? allProjets.length,
      tachesRestantes,
      tachesTerminees,
      tachesEnRetard,
      notesTotal: notesQuery.data?.meta.total ?? 0,
    };
  }, [allProjets, allTaches, projetsQuery.data?.meta.total, notesQuery.data?.meta.total]);

  const filteredProjets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProjets.filter((p) => {
      if (statusFilter === "active" && p.estTermine) return false;
      if (statusFilter === "done" && !p.estTermine) return false;
      if (!q) return true;
      return (
        p.titre.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [allProjets, search, statusFilter]);

  const filteredTaches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTaches.filter((t) => {
      if (statusFilter === "active" && t.estTerminee) return false;
      if (statusFilter === "done" && !t.estTerminee) return false;
      if (!q) return true;
      return (
        t.titre.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [allTaches, search, statusFilter]);

  const handleProjetSubmit = async (dto: CreateProjetDto) => {
    if (projetModal.item) {
      await updateProjet.mutateAsync({ id: projetModal.item.id, dto });
    } else {
      await createProjet.mutateAsync(dto);
    }
    setProjetModal({ open: false, item: null });
  };

  const handleTacheSubmit = async (dto: CreateTacheDto) => {
    if (tacheModal.item) {
      await updateTache.mutateAsync({ id: tacheModal.item.id, dto });
    } else {
      await createTache.mutateAsync(dto);
    }
    setTacheModal({ open: false, item: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "projet") {
      await deleteProjet.mutateAsync(deleteTarget.item.id);
    } else {
      await deleteTache.mutateAsync(deleteTarget.item.id);
    }
    setDeleteTarget(null);
  };

  const activeMeta =
    activeTab === "projets" ? projetsQuery.data?.meta : tachesQuery.data?.meta;

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
              Projets & Tâches
            </h1>
          </div>

          <button
            type="button"
            disabled={!activeEspaceId}
            onClick={() =>
              activeTab === "projets"
                ? setProjetModal({ open: true, item: null })
                : setTacheModal({ open: true, item: null })
            }
            className="apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "projets" ? "Nouveau projet" : "Nouvelle tâche"}
          </button>
        </div>

        {isLoadingEspace || projetsQuery.isLoading || tachesQuery.isLoading ? (
          <ProductivityKpiSkeleton />
        ) : (
          <>
            <ProductivityKpiGrid {...kpis} />
            <TacheProgressRing
              completed={kpis.tachesTerminees}
              total={allTaches.length}
            />
          </>
        )}

        {/* Onglets segmentés */}
        <div
          role="tablist"
          aria-label="Vues productivité"
          className="apple-surface grid grid-cols-2 gap-1 rounded-2xl p-1.5"
        >
          {(
            [
              { id: "projets", label: "Projets", icon: FolderKanban },
              { id: "taches", label: "Tâches", icon: CheckSquare },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`relative flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="productivity-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-[var(--bg-elevated)] shadow-sm ring-1 ring-[var(--border-subtle)]"
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <ProductivityFiltersBar
          search={search}
          onSearchChange={setSearch}
          showStatusFilter
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          tri={activeTab === "projets" ? projetTri : tacheTri}
          sortOptions={
            activeTab === "projets"
              ? [
                  { value: "createdAt", label: "Ajout récent" },
                  { value: "dateDebut", label: "Date de début" },
                  { value: "titre", label: "Titre" },
                ]
              : [
                  { value: "dateLimite", label: "Date limite" },
                  { value: "createdAt", label: "Ajout récent" },
                  { value: "titre", label: "Titre" },
                ]
          }
          onTriChange={(val) => {
            if (activeTab === "projets") {
              setProjetTri(val as "createdAt" | "dateDebut" | "titre");
            } else {
              setTacheTri(val as "dateLimite" | "createdAt" | "titre");
            }
            setPage(1);
          }}
          ordre={ordre}
          onToggleOrdre={() =>
            setOrdre((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          page={activeMeta?.page ?? page}
          totalPages={
            activeMeta
              ? Math.max(1, Math.ceil(activeMeta.total / activeMeta.limit))
              : 1
          }
          totalItems={activeMeta?.total ?? 0}
          onPageChange={setPage}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {activeTab === "projets" ? (
              <ProjetList
                items={filteredProjets}
                isLoading={projetsQuery.isLoading}
                onCreate={() => setProjetModal({ open: true, item: null })}
                onToggleDone={(projet) =>
                  updateProjet.mutate({
                    id: projet.id,
                    dto: { estTermine: !projet.estTermine },
                  })
                }
                onEdit={(item) => setProjetModal({ open: true, item })}
                onDelete={(item) => setDeleteTarget({ kind: "projet", item })}
              />
            ) : (
              <TacheList
                items={filteredTaches}
                isLoading={tachesQuery.isLoading}
                onCreate={() => setTacheModal({ open: true, item: null })}
                onToggle={(tache) =>
                  updateTache.mutate({
                    id: tache.id,
                    dto: { estTerminee: !tache.estTerminee },
                  })
                }
                onEdit={(item) => setTacheModal({ open: true, item })}
                onDelete={(item) => setDeleteTarget({ kind: "tache", item })}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <ProjetFormModal
          open={projetModal.open}
          initialData={projetModal.item}
          isPending={createProjet.isPending || updateProjet.isPending}
          onClose={() => setProjetModal({ open: false, item: null })}
          onSubmit={(dto) => void handleProjetSubmit(dto)}
        />

        <TacheFormModal
          open={tacheModal.open}
          initialData={tacheModal.item}
          isPending={createTache.isPending || updateTache.isPending}
          onClose={() => setTacheModal({ open: false, item: null })}
          onSubmit={(dto) => void handleTacheSubmit(dto)}
        />

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title={
            deleteTarget?.kind === "projet"
              ? "Supprimer ce projet ?"
              : "Supprimer cette tâche ?"
          }
          description={
            deleteTarget
              ? `« ${deleteTarget.item.titre} » sera définitivement supprimé.`
              : ""
          }
          isPending={deleteProjet.isPending || deleteTache.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </MotionConfig>
  );
}
