import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Plus,
  Receipt,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { CashFlowChart } from "@/features/finances/components/CashFlowChart";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import {
  FinanceFiltersBar,
  type FinanceSortField,
} from "@/features/finances/components/FinanceFiltersBar";
import { FinanceKpiGrid } from "@/features/finances/components/FinanceKpiGrid";
import { FinanceKpiSkeleton } from "@/features/finances/components/FinanceSkeletons";
import { PaiementsDrawerModal } from "@/features/finances/components/PaiementsDrawerModal";
import { RelanceModal } from "@/features/finances/components/RelanceModal";
import { SuiviFormModal } from "@/features/finances/components/SuiviFormModal";
import { SuiviList } from "@/features/finances/components/SuiviList";
import { TransactionFormModal } from "@/features/finances/components/TransactionFormModal";
import { TransactionList } from "@/features/finances/components/TransactionList";
import {
  useAddCreancePaiementMutation,
  useCreateCreanceMutation,
  useCreanceDetail,
  useCreances,
  useCreancesResume,
  useDeleteCreanceMutation,
  useRemoveCreancePaiementMutation,
  useUpdateCreanceMutation,
} from "@/features/finances/hooks/useCreances";
import {
  useCreateDepenseMutation,
  useDeleteDepenseMutation,
  useDepenses,
  useUpdateDepenseMutation,
} from "@/features/finances/hooks/useDepenses";
import {
  useAddDettePaiementMutation,
  useCreateDetteMutation,
  useDeleteDetteMutation,
  useDetteDetail,
  useDettes,
  useDettesResume,
  useRemoveDettePaiementMutation,
  useUpdateDetteMutation,
} from "@/features/finances/hooks/useDettes";
import {
  useCreateRevenuMutation,
  useDeleteRevenuMutation,
  useRevenus,
  useUpdateRevenuMutation,
} from "@/features/finances/hooks/useRevenus";
import type {
  CreateCreanceDto,
  CreateDepenseDto,
  CreateDetteDto,
  CreatePaiementDto,
  CreateRevenuDto,
  Creance,
  Depense,
  Dette,
  Paiement,
  Revenu,
  StatutSuivi,
} from "@/types/finances";

/** Onglets disponibles dans le module Finances. */
export type FinanceTab = "revenus" | "depenses" | "dettes" | "creances";

type DeleteTarget =
  | { kind: "revenu"; item: Revenu }
  | { kind: "depense"; item: Depense }
  | { kind: "dette"; item: Dette }
  | { kind: "creance"; item: Creance }
  | { kind: "paiement"; suiviKind: "dette" | "creance"; suiviId: string; item: Paiement };

const TABS: {
  id: FinanceTab;
  label: string;
  icon: typeof ArrowDownLeft;
}[] = [
  { id: "revenus", label: "Revenus", icon: ArrowDownLeft },
  { id: "depenses", label: "Dépenses", icon: ArrowUpRight },
  { id: "dettes", label: "Dettes", icon: Receipt },
  { id: "creances", label: "Créances", icon: HandCoins },
];

/**
 * Vue principale du module Finances, entièrement connectée à l'API NestJS,
 * isolée par `espaceId` actif et animée avec `motion/react`.
 */
export function FinanceView() {
  const { activeEspace, activeEspaceId, isLoading: isLoadingEspace } = useActiveEspace();

  const [activeTab, setActiveTab] = useState<FinanceTab>("revenus");
  const [page, setPage] = useState(1);
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [tri, setTri] = useState<FinanceSortField>("date");
  const [ordre, setOrdre] = useState<"asc" | "desc">("desc");
  const [statut, setStatut] = useState<StatutSuivi | "">("");

  // États des modales
  const [txModal, setTxModal] = useState<{
    open: boolean;
    kind: "revenu" | "depense";
    item: Revenu | Depense | null;
  }>({ open: false, kind: "revenu", item: null });

  const [suiviModal, setSuiviModal] = useState<{
    open: boolean;
    kind: "dette" | "creance";
    item: Dette | Creance | null;
  }>({ open: false, kind: "dette", item: null });

  const [paiementsTarget, setPaiementsTarget] = useState<{
    kind: "dette" | "creance";
    id: string;
  } | null>(null);

  const [relanceTarget, setRelanceTarget] = useState<Creance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const txQuery = useMemo(
    () => ({
      page,
      limit: 20,
      tri: tri === "datePromise" ? ("date" as const) : tri,
      ordre,
      ...(du ? { du } : {}),
      ...(au ? { au } : {}),
    }),
    [page, tri, ordre, du, au],
  );

  const suiviQuery = useMemo(
    () => ({
      page,
      limit: 20,
      tri: tri === "createdAt" ? ("date" as const) : tri,
      ordre,
      ...(du ? { du } : {}),
      ...(au ? { au } : {}),
      ...(statut ? { statut } : {}),
    }),
    [page, tri, ordre, du, au, statut],
  );

  // Requêtes API scopées par espaceId
  const revenusQuery = useRevenus(activeEspaceId, txQuery);
  const depensesQuery = useDepenses(activeEspaceId, txQuery);
  const dettesQuery = useDettes(activeEspaceId, suiviQuery);
  const creancesQuery = useCreances(activeEspaceId, suiviQuery);
  const dettesResume = useDettesResume(activeEspaceId);
  const creancesResume = useCreancesResume(activeEspaceId);

  const detteDetail = useDetteDetail(
    activeEspaceId,
    paiementsTarget?.kind === "dette" ? paiementsTarget.id : null,
  );
  const creanceDetail = useCreanceDetail(
    activeEspaceId,
    paiementsTarget?.kind === "creance" ? paiementsTarget.id : null,
  );

  // Mutations
  const createRevenu = useCreateRevenuMutation(activeEspaceId);
  const updateRevenu = useUpdateRevenuMutation(activeEspaceId);
  const deleteRevenu = useDeleteRevenuMutation(activeEspaceId);

  const createDepense = useCreateDepenseMutation(activeEspaceId);
  const updateDepense = useUpdateDepenseMutation(activeEspaceId);
  const deleteDepense = useDeleteDepenseMutation(activeEspaceId);

  const createDette = useCreateDetteMutation(activeEspaceId);
  const updateDette = useUpdateDetteMutation(activeEspaceId);
  const deleteDette = useDeleteDetteMutation(activeEspaceId);
  const addDettePaiement = useAddDettePaiementMutation(activeEspaceId);
  const removeDettePaiement = useRemoveDettePaiementMutation(activeEspaceId);

  const createCreance = useCreateCreanceMutation(activeEspaceId);
  const updateCreance = useUpdateCreanceMutation(activeEspaceId);
  const deleteCreance = useDeleteCreanceMutation(activeEspaceId);
  const addCreancePaiement = useAddCreancePaiementMutation(activeEspaceId);
  const removeCreancePaiement = useRemoveCreancePaiementMutation(activeEspaceId);

  const totalRevenus = useMemo(
    () => (revenusQuery.data?.data ?? []).reduce((sum, r) => sum + r.montant, 0),
    [revenusQuery.data],
  );
  const totalDepenses = useMemo(
    () => (depensesQuery.data?.data ?? []).reduce((sum, d) => sum + d.montant, 0),
    [depensesQuery.data],
  );

  const handleTabChange = (nextTab: FinanceTab) => {
    setActiveTab(nextTab);
    setPage(1);
    if (
      (nextTab === "revenus" || nextTab === "depenses") &&
      tri === "datePromise"
    ) {
      setTri("date");
    }
    if ((nextTab === "dettes" || nextTab === "creances") && tri === "createdAt") {
      setTri("date");
    }
  };

  const handleResetFilters = () => {
    setDu("");
    setAu("");
    setStatut("");
    setPage(1);
  };

  const openCreateForActiveTab = () => {
    if (activeTab === "revenus") {
      setTxModal({ open: true, kind: "revenu", item: null });
    } else if (activeTab === "depenses") {
      setTxModal({ open: true, kind: "depense", item: null });
    } else if (activeTab === "dettes") {
      setSuiviModal({ open: true, kind: "dette", item: null });
    } else {
      setSuiviModal({ open: true, kind: "creance", item: null });
    }
  };

  const handleTxSubmit = async (dto: CreateRevenuDto & CreateDepenseDto) => {
    if (txModal.kind === "revenu") {
      if (txModal.item) {
        await updateRevenu.mutateAsync({ id: txModal.item.id, dto });
      } else {
        await createRevenu.mutateAsync(dto);
      }
    } else if (txModal.item) {
      await updateDepense.mutateAsync({ id: txModal.item.id, dto });
    } else {
      await createDepense.mutateAsync(dto);
    }
    setTxModal((prev) => ({ ...prev, open: false }));
  };

  const handleSuiviSubmit = async (dto: CreateDetteDto & CreateCreanceDto) => {
    if (suiviModal.kind === "dette") {
      if (suiviModal.item) {
        await updateDette.mutateAsync({ id: suiviModal.item.id, dto });
      } else {
        await createDette.mutateAsync(dto);
      }
    } else if (suiviModal.item) {
      await updateCreance.mutateAsync({ id: suiviModal.item.id, dto });
    } else {
      await createCreance.mutateAsync(dto);
    }
    setSuiviModal((prev) => ({ ...prev, open: false }));
  };

  const handleAddPaiement = async (dto: CreatePaiementDto) => {
    if (!paiementsTarget) return;
    if (paiementsTarget.kind === "dette") {
      await addDettePaiement.mutateAsync({
        detteId: paiementsTarget.id,
        dto,
      });
    } else {
      await addCreancePaiement.mutateAsync({
        creanceId: paiementsTarget.id,
        dto,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "revenu") {
      await deleteRevenu.mutateAsync(deleteTarget.item.id);
    } else if (deleteTarget.kind === "depense") {
      await deleteDepense.mutateAsync(deleteTarget.item.id);
    } else if (deleteTarget.kind === "dette") {
      await deleteDette.mutateAsync(deleteTarget.item.id);
    } else if (deleteTarget.kind === "creance") {
      await deleteCreance.mutateAsync(deleteTarget.item.id);
    } else if (deleteTarget.kind === "paiement") {
      if (deleteTarget.suiviKind === "dette") {
        await removeDettePaiement.mutateAsync({
          detteId: deleteTarget.suiviId,
          paiementId: deleteTarget.item.id,
        });
      } else {
        await removeCreancePaiement.mutateAsync({
          creanceId: deleteTarget.suiviId,
          paiementId: deleteTarget.item.id,
        });
      }
    }
    setDeleteTarget(null);
  };

  const isDeleting =
    deleteRevenu.isPending ||
    deleteDepense.isPending ||
    deleteDette.isPending ||
    deleteCreance.isPending ||
    removeDettePaiement.isPending ||
    removeCreancePaiement.isPending;

  const isKpiLoading =
    isLoadingEspace ||
    revenusQuery.isLoading ||
    depensesQuery.isLoading ||
    dettesResume.isLoading ||
    creancesResume.isLoading;

  const activeMeta =
    activeTab === "revenus"
      ? revenusQuery.data?.meta
      : activeTab === "depenses"
        ? depensesQuery.data?.meta
        : activeTab === "dettes"
          ? dettesQuery.data?.meta
          : creancesQuery.data?.meta;

  const activePaiementsItem =
    paiementsTarget?.kind === "dette"
      ? (detteDetail.data ??
        dettesQuery.data?.data.find((d) => d.id === paiementsTarget.id) ??
        null)
      : paiementsTarget?.kind === "creance"
        ? (creanceDetail.data ??
          creancesQuery.data?.data.find((c) => c.id === paiementsTarget.id) ??
          null)
        : null;

  const ctaLabel =
    activeTab === "revenus"
      ? "Nouveau revenu"
      : activeTab === "depenses"
        ? "Nouvelle dépense"
        : activeTab === "dettes"
          ? "Nouvelle dette"
          : "Nouvelle créance";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6 pb-24">
        {/* En-tête contextuel */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
              <Sparkles className="h-3 w-3" />
              {activeEspace?.nom ?? "Espace actif"}
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Finances & Trésorerie
            </h1>
          </div>

          <button
            type="button"
            disabled={!activeEspaceId}
            onClick={openCreateForActiveTab}
            className="apple-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {ctaLabel}
          </button>
        </div>

        {/* Cartes KPI & Graphique */}
        {isKpiLoading ? (
          <FinanceKpiSkeleton />
        ) : (
          <>
            <FinanceKpiGrid
              totalRevenus={totalRevenus}
              totalDepenses={totalDepenses}
              totalDettesRestant={dettesResume.data?.totalRestant ?? 0}
              totalCreancesRestant={creancesResume.data?.totalRestant ?? 0}
              dettesEnRetard={dettesResume.data?.nombreEnRetard ?? 0}
              creancesEnRetard={creancesResume.data?.nombreEnRetard ?? 0}
            />
            <CashFlowChart
              totalRevenus={totalRevenus}
              totalDepenses={totalDepenses}
              totalCreancesRestant={creancesResume.data?.totalRestant ?? 0}
              totalDettesRestant={dettesResume.data?.totalRestant ?? 0}
            />
          </>
        )}

        {/* Navigation segmentée style Apple */}
        <div
          role="tablist"
          aria-label="Catégories financières"
          className="apple-surface grid grid-cols-2 gap-1 rounded-2xl p-1.5 sm:grid-cols-4"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="finance-tab-pill"
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

        {/* Filtres & Pagination */}
        <FinanceFiltersBar
          du={du}
          au={au}
          tri={tri}
          ordre={ordre}
          showStatutFilter={activeTab === "dettes" || activeTab === "creances"}
          statut={statut}
          page={activeMeta?.page ?? page}
          totalPages={
            activeMeta
              ? Math.max(1, Math.ceil(activeMeta.total / activeMeta.limit))
              : 1
          }
          totalItems={activeMeta?.total ?? 0}
          onDuChange={(val) => {
            setDu(val);
            setPage(1);
          }}
          onAuChange={(val) => {
            setAu(val);
            setPage(1);
          }}
          onTriChange={(val) => {
            setTri(val);
            setPage(1);
          }}
          onToggleOrdre={() => {
            setOrdre((prev) => (prev === "desc" ? "asc" : "desc"));
            setPage(1);
          }}
          onStatutChange={(val) => {
            setStatut(val);
            setPage(1);
          }}
          onPageChange={setPage}
          onReset={handleResetFilters}
        />

        {/* Liste active */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {activeTab === "revenus" && (
              <TransactionList
                kind="revenu"
                items={revenusQuery.data?.data ?? []}
                isLoading={revenusQuery.isLoading}
                onCreate={openCreateForActiveTab}
                onEdit={(item) =>
                  setTxModal({ open: true, kind: "revenu", item })
                }
                onDelete={(item) =>
                  setDeleteTarget({ kind: "revenu", item: item as Revenu })
                }
              />
            )}

            {activeTab === "depenses" && (
              <TransactionList
                kind="depense"
                items={depensesQuery.data?.data ?? []}
                isLoading={depensesQuery.isLoading}
                onCreate={openCreateForActiveTab}
                onEdit={(item) =>
                  setTxModal({ open: true, kind: "depense", item })
                }
                onDelete={(item) =>
                  setDeleteTarget({ kind: "depense", item: item as Depense })
                }
              />
            )}

            {activeTab === "dettes" && (
              <SuiviList
                kind="dette"
                items={dettesQuery.data?.data ?? []}
                isLoading={dettesQuery.isLoading}
                onCreate={openCreateForActiveTab}
                onOpenPaiements={(item) =>
                  setPaiementsTarget({ kind: "dette", id: item.id })
                }
                onEdit={(item) =>
                  setSuiviModal({ open: true, kind: "dette", item })
                }
                onDelete={(item) =>
                  setDeleteTarget({ kind: "dette", item: item as Dette })
                }
              />
            )}

            {activeTab === "creances" && (
              <SuiviList
                kind="creance"
                items={creancesQuery.data?.data ?? []}
                isLoading={creancesQuery.isLoading}
                onCreate={openCreateForActiveTab}
                onOpenPaiements={(item) =>
                  setPaiementsTarget({ kind: "creance", id: item.id })
                }
                onOpenRelance={(item) => setRelanceTarget(item)}
                onEdit={(item) =>
                  setSuiviModal({ open: true, kind: "creance", item })
                }
                onDelete={(item) =>
                  setDeleteTarget({ kind: "creance", item: item as Creance })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modales */}
        <TransactionFormModal
          open={txModal.open}
          kind={txModal.kind}
          initialData={txModal.item}
          isPending={
            createRevenu.isPending ||
            updateRevenu.isPending ||
            createDepense.isPending ||
            updateDepense.isPending
          }
          onClose={() => setTxModal((prev) => ({ ...prev, open: false }))}
          onSubmit={(dto) => void handleTxSubmit(dto)}
        />

        <SuiviFormModal
          open={suiviModal.open}
          kind={suiviModal.kind}
          initialData={suiviModal.item}
          isPending={
            createDette.isPending ||
            updateDette.isPending ||
            createCreance.isPending ||
            updateCreance.isPending
          }
          onClose={() => setSuiviModal((prev) => ({ ...prev, open: false }))}
          onSubmit={(dto) => void handleSuiviSubmit(dto)}
        />

        <PaiementsDrawerModal
          open={Boolean(paiementsTarget)}
          kind={paiementsTarget?.kind ?? "dette"}
          item={activePaiementsItem}
          isLoadingDetail={
            paiementsTarget?.kind === "dette"
              ? detteDetail.isLoading
              : creanceDetail.isLoading
          }
          isSubmitting={
            addDettePaiement.isPending || addCreancePaiement.isPending
          }
          onClose={() => setPaiementsTarget(null)}
          onAddPaiement={handleAddPaiement}
          onRemovePaiement={(paiement) => {
            if (!paiementsTarget) return;
            setDeleteTarget({
              kind: "paiement",
              suiviKind: paiementsTarget.kind,
              suiviId: paiementsTarget.id,
              item: paiement,
            });
          }}
        />

        <RelanceModal
          open={Boolean(relanceTarget)}
          espaceId={activeEspaceId}
          creance={relanceTarget}
          onClose={() => setRelanceTarget(null)}
        />

        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          title={
            deleteTarget?.kind === "paiement"
              ? "Annuler ce paiement ?"
              : "Supprimer cet élément ?"
          }
          description={
            deleteTarget?.kind === "paiement"
              ? `Le montant de ${deleteTarget.item.montant.toLocaleString("fr-FR")} FCFA sera réintégré au solde restant.`
              : deleteTarget
                ? `« ${deleteTarget.item.description} » sera définitivement supprimé.`
                : ""
          }
          isPending={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </MotionConfig>
  );
}
