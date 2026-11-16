import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  HandCoins,
  Plus,
  Receipt,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";
import { ContactsSection } from "@/features/contacts/components/ContactsSection";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { CashFlowChart } from "@/features/finances/components/CashFlowChart";
import { CategoryBudgetsCard } from "@/features/finances/components/CategoryBudgetsCard";
import { useFinancesResume } from "@/features/finances/hooks/useFinancesResume";
import { DeleteConfirmDialog } from "@/features/finances/components/DeleteConfirmDialog";
import {
  FinanceFiltersBar,
  type FinanceSortField,
} from "@/features/finances/components/FinanceFiltersBar";
import { FinanceContextSummary } from "@/features/finances/components/FinanceContextSummary";
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
export type FinanceTab =
  | "revenus"
  | "depenses"
  | "dettes"
  | "creances"
  | "contacts";

type DeleteTarget =
  | { kind: "revenu"; item: Revenu }
  | { kind: "depense"; item: Depense }
  | { kind: "dette"; item: Dette }
  | { kind: "creance"; item: Creance }
  | { kind: "paiement"; suiviKind: "dette" | "creance"; suiviId: string; item: Paiement };

/**
 * Propriétés de la vue principale du module Finances.
 */
export interface FinanceViewProps {
  /** Sous-onglet financier actif piloté par la barre de navigation inférieure. */
  activeSubTab?: FinanceTab;
}

/**
 * Vue principale du module Finances, entièrement connectée à l'API NestJS,
 * isolée par `espaceId` actif et animée avec `motion/react`.
 */
export function FinanceView({ activeSubTab = "revenus" }: FinanceViewProps = {}) {
  const { activeEspace, activeEspaceId, isLoading: isLoadingEspace } = useActiveEspace();

  const activeTab = activeSubTab;
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
  const [contactCreateSignal, setContactCreateSignal] = useState(0);
  const [showChart, setShowChart] = useState(false);

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

  const financesResume = useFinancesResume(activeEspaceId);

  const totalRevenus = useMemo(
    () =>
      financesResume.data?.totalRevenus ??
      (revenusQuery.data?.data ?? []).reduce((sum, r) => sum + r.montant, 0),
    [financesResume.data?.totalRevenus, revenusQuery.data],
  );
  const totalDepenses = useMemo(
    () =>
      financesResume.data?.totalDepenses ??
      (depensesQuery.data?.data ?? []).reduce((sum, d) => sum + d.montant, 0),
    [financesResume.data?.totalDepenses, depensesQuery.data],
  );

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
    } else if (activeTab === "creances") {
      setSuiviModal({ open: true, kind: "creance", item: null });
    } else {
      setContactCreateSignal((n) => n + 1);
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

  const { t } = useTranslation();
  const ctaLabel = t(`finances.cta.${activeTab}`);

  const sectionMeta = {
    revenus: {
      title: "Revenus",
      subtitle: "Entrées d'argent et encaissements",
      Icon: ArrowDownLeft,
      iconClass:
        "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
      ctaClass:
        "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
    },
    depenses: {
      title: "Dépenses",
      subtitle: "Suivi des sorties et charges",
      Icon: ArrowUpRight,
      iconClass:
        "bg-rose-500/12 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
      ctaClass: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25",
    },
    dettes: {
      title: "Dettes",
      subtitle: "Engagements à rembourser et échéances",
      Icon: Receipt,
      iconClass:
        "bg-amber-500/12 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
      ctaClass: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
    },
    creances: {
      title: "Créances",
      subtitle: "Montants à recevoir et relances",
      Icon: HandCoins,
      iconClass:
        "bg-sky-500/12 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
      ctaClass: "bg-sky-600 hover:bg-sky-500 shadow-sky-500/25",
    },
    contacts: {
      title: "Contacts financiers",
      subtitle: "Clients, fournisseurs et tiers",
      Icon: Users,
      iconClass:
        "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
      ctaClass: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
    },
  }[activeTab];

  const ActiveIcon = sectionMeta.Icon;

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5 pb-10">
        {/* En-tête Bento contextuel */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs sm:p-5">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 min-w-0">
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
                  <span className="truncate">{activeEspace?.nom ?? t("common.activeSpace")}</span>
                </div>
                <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
                  {t(`finances.sections.${activeTab}.title`)}
                </h1>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {t(`finances.sections.${activeTab}.subtitle`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== "contacts" && (
                <button
                  type="button"
                  onClick={() => setShowChart((v) => !v)}
                  aria-expanded={showChart}
                  className="apple-press inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  <span className="hidden sm:inline">{t("finances.chartBtn")}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      showChart && "rotate-180",
                    )}
                  />
                </button>
              )}

              <button
                type="button"
                disabled={!activeEspaceId}
                onClick={openCreateForActiveTab}
                className={cn(
                  "apple-press inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50 sm:flex-initial",
                  sectionMeta.ctaClass,
                )}
              >
                <Plus className="h-4 w-4" />
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Synthèse contextuelle dédiée à l'onglet actif */}
        {activeTab !== "contacts" &&
          (isKpiLoading ? (
            <FinanceKpiSkeleton />
          ) : (
            <>
              <FinanceContextSummary
                activeTab={activeTab}
                totalRevenus={totalRevenus}
                revenusCount={revenusQuery.data?.data.length ?? 0}
                totalDepenses={totalDepenses}
                depensesCount={depensesQuery.data?.data.length ?? 0}
                dettesResume={dettesResume.data}
                creancesResume={creancesResume.data}
              />
              <AnimatePresence initial={false}>
                {showChart && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <CashFlowChart
                      totalRevenus={totalRevenus}
                      totalDepenses={totalDepenses}
                      totalCreancesRestant={
                        creancesResume.data?.totalRestant ?? 0
                      }
                      totalDettesRestant={dettesResume.data?.totalRestant ?? 0}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ))}

        {/* Filtres & Pagination */}
        {activeTab !== "contacts" && (
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
        )}

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
              <>
                <CategoryBudgetsCard
                  espaceId={activeEspaceId}
                  budgets={financesResume.data?.budgets ?? []}
                />
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
              </>
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

            {activeTab === "contacts" && (
              <ContactsSection createOpenSignal={contactCreateSignal} />
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
