import { useMemo, useState } from "react";
import { CheckSquare, Flame, FolderKanban, Lightbulb, Plus } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useTranslation } from "react-i18next";
import { IdeesView } from "@/components/views/IdeesView";
import { HabitudesSection } from "@/features/productivity/components/HabitudesSection";
import { cn } from "@/lib/utils";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import {
  ProductivityFiltersBar,
  type ProductivityStatusFilter,
} from "@/features/productivity/components/ProductivityFiltersBar";
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

/**
 * Sous-onglets de l'univers Projets pilotés par la barre de navigation inférieure.
 */
export type ProjetsSubTab = "projets" | "taches" | "habitudes" | "notes";

/**
 * Propriétés de la vue Projets, Tâches & Notes.
 */
export interface ProjetsViewProps {
  /** Sous-onglet actif contrôlé par `BottomNav`. */
  activeSubTab?: ProjetsSubTab;
}

type DeleteTarget =
  | { kind: "projet"; item: Projet }
  | { kind: "tache"; item: Tache };

/**
 * Vue principale Projets, Tâches & Notes connectée à l'API NestJS,
 * isolée par `espaceId` actif et animée avec `motion/react`.
 */
export function ProjetsView({ activeSubTab = "projets" }: ProjetsViewProps = {}) {
  const { t } = useTranslation();
  const { activeEspace, activeEspaceId, isLoading: isLoadingEspace } =
    useActiveEspace();

  const activeTab = activeSubTab;
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

  const sectionMeta = {
    projets: {
      title: "Projets",
      subtitle: "Jalons, livrables et suivi d'avancement",
      Icon: FolderKanban,
      iconClass:
        "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
      ctaClass: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
    },
    taches: {
      title: "Tâches",
      subtitle: "Actions prioritaires (en solo ou liées à un projet)",
      Icon: CheckSquare,
      iconClass:
        "bg-sky-500/12 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
      ctaClass: "bg-sky-600 hover:bg-sky-500 shadow-sky-500/25",
    },
    habitudes: {
      title: "Habitudes",
      subtitle: "Discipline quotidienne et séries actives",
      Icon: Flame,
      iconClass:
        "bg-orange-500/12 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
      ctaClass: "bg-orange-600 hover:bg-orange-500 shadow-orange-500/25",
    },
    notes: {
      title: "Notes & Idées",
      subtitle: "Capture rapide, idées et comptes-rendus",
      Icon: Lightbulb,
      iconClass:
        "bg-amber-500/12 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
      ctaClass: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
    },
  }[activeTab];

  const ActiveIcon = sectionMeta.Icon;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5 pb-10">
        {activeTab !== "notes" && activeTab !== "habitudes" && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs sm:p-5">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    sectionMeta.iconClass,
                  )}
                >
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="truncate">
                      {activeEspace?.nom ?? t("common.activeSpace")}
                    </span>
                  </div>
                  <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
                    {t(`projets.sections.${activeTab}.title`)}
                  </h1>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {t(`projets.sections.${activeTab}.subtitle`)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!activeEspaceId}
                onClick={() =>
                  activeTab === "projets"
                    ? setProjetModal({ open: true, item: null })
                    : setTacheModal({ open: true, item: null })
                }
                className={cn(
                  "apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50",
                  sectionMeta.ctaClass,
                )}
              >
                <Plus className="h-4 w-4" />
                {activeTab === "projets"
                  ? t("projets.newProject")
                  : t("projets.newTask")}
              </button>
            </div>
          </div>
        )}

        {activeTab === "notes" ? (
          <IdeesView embedded />
        ) : activeTab === "habitudes" ? (
          <HabitudesSection espaceId={activeEspaceId} />
        ) : (
          <>
            {isLoadingEspace ||
            projetsQuery.isLoading ||
            tachesQuery.isLoading ? (
              <ProductivityKpiSkeleton />
            ) : activeTab === "projets" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {t("projets.activeProjectsKpi")}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">
                    {kpis.projetsActifs}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--muted-foreground)] tabular-nums">
                    {t("projets.ofTotalProjects", { count: allProjets.length })}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {t("projets.completedProjectsKpi")}
                  </span>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {allProjets.length - kpis.projetsActifs}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${
                          allProjets.length > 0
                            ? Math.round(
                                ((allProjets.length - kpis.projetsActifs) /
                                  allProjets.length) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <TacheProgressRing
                completed={kpis.tachesTerminees}
                total={allTaches.length}
              />
            )}

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
          </>
        )}

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
          projets={allProjets}
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
