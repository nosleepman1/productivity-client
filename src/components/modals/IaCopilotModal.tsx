import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crown,
  History,
  Loader2,
  PanelLeft,
  Plus,
  SquarePen,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { extractApiError } from "@/api/api";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { formatFcfa } from "@/features/finances/utils/format";
import {
  iaApi,
  type IaExecutableAction,
  type IaProviderId,
} from "@/features/ia/api/ia.api";
import {
  useIaChatMutation,
  useIaConversations,
  useIaDeleteConversationMutation,
  useIaExecuteActionsMutation,
  useIaStatus,
} from "@/features/ia/hooks/useIa";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast.store";

export interface IaCopilotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenManualQuickAdd: () => void;
  onOpenSubscriptions?: () => void;
}

interface ChatItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: IaProviderId | string | null;
  model?: string | null;
  thinkingSec?: string;
  toolsUsed?: string[];
  proposedActions?: IaExecutableAction[];
  actionState?: "pending" | "executing" | "done" | "dismissed";
  isQuotaError?: boolean;
}

const TOOL_LABEL_KEYS: Record<string, string> = {
  getFinanceSummary: "ia.tools.getFinanceSummary",
  listRecentTransactions: "ia.tools.listRecentTransactions",
  listDettesCreances: "ia.tools.listDettesCreances",
  listTaches: "ia.tools.listTaches",
  listProjets: "ia.tools.listProjets",
  listHabitudes: "ia.tools.listHabitudes",
  listNotes: "ia.tools.listNotes",
  proposeAction: "ia.tools.proposeAction",
};

const getNowMs = (): number => Date.now();

const MarkdownReply: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-2.5 text-sm leading-7 text-[var(--foreground)] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-4 mb-1.5 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-3.5 mb-1 text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-3 mb-1 text-sm font-semibold text-[var(--foreground)]">
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="leading-7">{children}</p>,
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 ps-5 marker:text-[var(--muted-foreground)]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 ps-5 marker:font-medium marker:text-[var(--muted-foreground)]">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-6">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--foreground)]">
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-s-2 border-[var(--border)] ps-3 text-[var(--muted-foreground)] italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-[var(--border)]" />,
        code: ({ className, children, ...props }) => {
          const isBlock = Boolean(className?.includes("language-"));
          if (isBlock) {
            return (
              <code
                className="block overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--muted)]/70 px-3.5 py-2.5 font-mono text-xs leading-relaxed text-[var(--foreground)]"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        table: ({ children }) => (
          <div className="my-2.5 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-left text-xs">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[var(--muted)]/60 text-[var(--foreground)]">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-[var(--border)]/60 px-3 py-1.5">
            {children}
          </td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export const IaCopilotModal: React.FC<IaCopilotModalProps> = ({
  open,
  onOpenChange,
  onOpenManualQuickAdd,
  onOpenSubscriptions,
}) => {
  const { t } = useTranslation();
  const { activeEspaceId } = useActiveEspace();

  const statusQuery = useIaStatus(open ? activeEspaceId : null);
  const conversationsQuery = useIaConversations(activeEspaceId, open);
  const chatMutation = useIaChatMutation(activeEspaceId);
  const executeBatchMutation = useIaExecuteActionsMutation(activeEspaceId);
  const deleteConvMutation = useIaDeleteConversationMutation(activeEspaceId);

  const [conversationId, setConversationId] = useState<string | undefined>();
  const [selectedProvider, setSelectedProvider] = useState<
    IaProviderId | undefined
  >();
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Track which message's "Thought" accordion or "Batch Details" is expanded
  const [expandedThoughts, setExpandedThoughts] = useState<
    Record<string, boolean>
  >({});
  const [expandedActions, setExpandedActions] = useState<
    Record<string, boolean>
  >({});
  // Track deselected indices per messageId when reviewing batch actions
  const [deselectedMap, setDeselectedMap] = useState<
    Record<string, Record<number, boolean>>
  >({});

  // Live ChatGPT-style thinking phase & elapsed timer
  const [thinkingPhase, setThinkingPhase] = useState<0 | 1 | 2>(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const msgSeqRef = useRef(0);
  const nextId = (prefix: string) => {
    msgSeqRef.current += 1;
    return `${prefix}-${msgSeqRef.current}`;
  };

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatMutation.isPending) {
      return;
    }

    const start = Date.now();
    const timer = window.setInterval(() => {
      const diff = Date.now() - start;
      setElapsedMs(diff);
      if (diff > 2400) setThinkingPhase(2);
      else if (diff > 900) setThinkingPhase(1);
      else setThinkingPhase(0);
    }, 150);

    return () => window.clearInterval(timer);
  }, [chatMutation.isPending]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const activeProvider =
    selectedProvider ?? statusQuery.data?.defaultProvider ?? "deepseek";

  const quota = statusQuery.data?.quota;
  const quotaPct = quota
    ? quota.dailyLimit > 0
      ? Math.min(100, Math.round((quota.usedToday / quota.dailyLimit) * 100))
      : 100
    : 0;
  const isQuotaExhausted = quota ? quota.remainingToday <= 0 : false;

  const handleNewChat = () => {
    setConversationId(undefined);
    setMessages([]);
    setMobileSidebarOpen(false);
  };

  const handleLoadConversation = async (id: string) => {
    if (!activeEspaceId) return;
    try {
      const detail = await iaApi.getConversation(activeEspaceId, id);
      setConversationId(detail.id);
      setMessages(
        detail.messages.map((m) => {
          const raw = m.actionProposee as unknown;
          const actions: IaExecutableAction[] = Array.isArray(raw)
            ? (raw as IaExecutableAction[])
            : raw
              ? [raw as IaExecutableAction]
              : [];
          return {
            id: m.id,
            role: m.role === "USER" ? "user" : "assistant",
            content: m.contenu,
            provider: m.provider,
            model: m.modele,
            proposedActions: actions,
            actionState: actions.length > 0 ? "pending" : undefined,
          };
        }),
      );
      setMobileSidebarOpen(false);
    } catch (err) {
      const apiErr = extractApiError(err);
      toast.error(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  const handleSend = async (promptOverride?: string) => {
    const text = (promptOverride ?? input).trim();
    if (!text || !activeEspaceId || chatMutation.isPending) return;

    if (!promptOverride) setInput("");
    setThinkingPhase(0);
    setElapsedMs(0);

    const startedAt = getNowMs();
    const userMsgId = nextId("u");
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: text },
    ]);

    try {
      const res = await chatMutation.mutateAsync({
        message: text,
        conversationId,
        provider: selectedProvider,
      });
      const thinkingSec = Math.max(
        0.2,
        (getNowMs() - startedAt) / 1000,
      ).toFixed(1);
      const actions =
        res.proposedActions && res.proposedActions.length > 0
          ? res.proposedActions
          : res.proposedAction
            ? [res.proposedAction]
            : [];

      setConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId("a"),
          role: "assistant",
          content: res.reply,
          provider: res.provider,
          model: res.model,
          thinkingSec,
          toolsUsed: res.toolsUsed,
          proposedActions: actions,
          actionState: actions.length > 0 ? "pending" : undefined,
        },
      ]);
    } catch (err) {
      const apiErr = extractApiError(err);
      const errText = Array.isArray(apiErr.message)
        ? apiErr.message[0]
        : apiErr.message;
      const isQuotaError = apiErr.statusCode === 429;
      toast.error(errText);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId("err"),
          role: "assistant",
          content: errText,
          isQuotaError,
        },
      ]);
    }
  };

  const handleExecuteActions = async (
    msgId: string,
    allActions: IaExecutableAction[],
  ) => {
    if (!activeEspaceId) return;
    const deselected = deselectedMap[msgId] ?? {};
    const selectedActions = allActions.filter((_, idx) => !deselected[idx]);
    if (selectedActions.length === 0) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, actionState: "executing" } : m,
      ),
    );
    try {
      await executeBatchMutation.mutateAsync(selectedActions);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, actionState: "done" } : m)),
      );
      toast.success(t("ia.actionDone"));
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, actionState: "pending" } : m,
        ),
      );
      const apiErr = extractApiError(err);
      toast.error(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  const handleDismissAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, actionState: "dismissed" } : m,
      ),
    );
  };

  const toggleActionItem = (msgId: string, idx: number) => {
    setDeselectedMap((prev) => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] ?? {}),
        [idx]: !(prev[msgId]?.[idx] ?? false),
      },
    }));
  };

  const phaseSteps = [
    t("ia.phaseThinking"),
    t("ia.phaseAnalysing"),
    t("ia.phasePreparing"),
  ];

  const starterPrompts = [
    t("ia.prompts.finance"),
    t("ia.prompts.tasks"),
    t("ia.prompts.expense"),
    t("ia.prompts.debts"),
  ];

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col">
      {/* Sidebar header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-sm">
            <BrainCircuit className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">
            {t("ia.title")}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            isMobile
              ? setMobileSidebarOpen(false)
              : setDesktopSidebarOpen(false)
          }
          aria-label={t("common.close")}
          className="apple-press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Primary sidebar actions: New chat + Quick add */}
      <div className="space-y-1 px-2.5 pb-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="apple-press flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <SquarePen className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <span className="truncate">{t("ia.newChat")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileSidebarOpen(false);
            onOpenChange(false);
            onOpenManualQuickAdd();
          }}
          className="apple-press flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <Plus className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <span className="truncate">{t("ia.manualAdd")}</span>
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1">
        <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          <History className="h-3 w-3" />
          <span>{t("ia.history")}</span>
        </div>

        {(conversationsQuery.data ?? []).length === 0 ? (
          <p className="px-2 py-6 text-xs text-[var(--muted-foreground)]">
            {t("ia.noHistory")}
          </p>
        ) : (
          <div className="space-y-0.5">
            {(conversationsQuery.data ?? []).map((conv) => {
              const isActive = conv.id === conversationId;
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-xl px-2.5 py-2 transition-colors",
                    isActive
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 hover:text-[var(--foreground)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void handleLoadConversation(conv.id)}
                    className="min-w-0 flex-1 text-start"
                  >
                    <p className="truncate text-xs font-medium text-[var(--foreground)]">
                      {conv.titre}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteConvMutation.mutateAsync(conv.id)}
                    aria-label={t("common.delete")}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-opacity hover:bg-rose-500/10 hover:text-rose-500",
                      isMobile
                        ? "opacity-80"
                        : "opacity-0 group-hover:opacity-100 focus:opacity-100",
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar footer: quota gauge + provider selector */}
      {(quota || statusQuery.data?.providers) && (
        <div className="space-y-2.5 border-t border-[var(--border)]/70 p-3">
          {quota && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-medium text-[var(--foreground)]">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {quota.planNom}
                </span>
                <span className="font-semibold tabular-nums text-[var(--foreground)]">
                  {quota.usedToday}/{quota.dailyLimit}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    quotaPct >= 100
                      ? "bg-rose-500"
                      : quotaPct >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${quotaPct}%` }}
                />
              </div>
              {onOpenSubscriptions && (
                <button
                  type="button"
                  onClick={onOpenSubscriptions}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-500/10 px-2 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400"
                >
                  <Crown className="h-3 w-3" />
                  {isQuotaExhausted ? "Augmenter mon quota" : "Gérer mon pack"}
                </button>
              )}
            </div>
          )}

          {statusQuery.data?.providers && (
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-0.5">
              {statusQuery.data.providers.map((p) => {
                const active = activeProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!p.configured}
                    onClick={() => setSelectedProvider(p.id)}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1 text-[11px] font-medium capitalize transition-colors disabled:opacity-35",
                      active
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    )}
                  >
                    {p.id}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ia-copilot-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex h-[96dvh] w-full max-w-5xl overflow-hidden rounded-t-[28px] border border-[var(--border)] bg-[var(--background)] shadow-2xl sm:h-[88dvh] sm:rounded-[28px]"
          >
            {/* Desktop collapsible sidebar (hidden on mobile) */}
            {desktopSidebarOpen && (
              <aside className="hidden w-[260px] shrink-0 border-e border-[var(--border)]/70 bg-[var(--card)]/40 md:block">
                {renderSidebarContent(false)}
              </aside>
            )}

            {/* Mobile slide-over sidebar drawer (hidden by default) */}
            <AnimatePresence>
              {mobileSidebarOpen && (
                <div className="absolute inset-0 z-30 flex md:hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                  />
                  <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    className="relative z-10 h-full w-[280px] max-w-[82vw] border-e border-[var(--border)] bg-[var(--background)] shadow-2xl"
                  >
                    {renderSidebarContent(true)}
                  </motion.aside>
                </div>
              )}
            </AnimatePresence>

            {/* Main chat column */}
            <div className="relative flex min-w-0 flex-1 flex-col">
              {/* Subtle top ambient glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/8 via-transparent to-transparent" />

              {/* Minimalist Top Bar */}
              <header className="relative flex items-center justify-between gap-2 border-b border-[var(--border)]/70 px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-2">
                  {/* Mobile sidebar trigger */}
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label={t("ia.history")}
                    title={t("ia.history")}
                    className="apple-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:hidden"
                  >
                    <PanelLeft className="h-4.5 w-4.5" />
                  </button>

                  {/* Desktop sidebar re-open trigger when collapsed */}
                  {!desktopSidebarOpen && (
                    <button
                      type="button"
                      onClick={() => setDesktopSidebarOpen(true)}
                      aria-label={t("ia.history")}
                      title={t("ia.history")}
                      className="apple-press hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:flex"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-sm md:hidden">
                      <BrainCircuit className="h-3.5 w-3.5" />
                    </div>
                    <h2
                      id="ia-copilot-title"
                      className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)] sm:text-base"
                    >
                      {t("ia.title")}
                    </h2>
                    <span className="hidden rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[10px] font-medium capitalize text-[var(--muted-foreground)] sm:inline-block">
                      {activeProvider}
                    </span>
                    {quota && (
                      <button
                        type="button"
                        onClick={onOpenSubscriptions}
                        title="Voir les abonnements"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums transition-colors",
                          isQuotaExhausted
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : quotaPct >= 80
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <Zap className="h-2.5 w-2.5" />
                        {quota.usedToday}/{quota.dailyLimit}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    aria-label={t("ia.newChat")}
                    title={t("ia.newChat")}
                    className="apple-press flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <SquarePen className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenManualQuickAdd();
                    }}
                    aria-label={t("ia.manualAdd")}
                    title={t("ia.manualAdd")}
                    className="apple-press inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("ia.manualAdd")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label={t("common.close")}
                    className="apple-press flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              {/* Body */}
              <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-8">
                {messages.length === 0 ? (
                <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-8 text-center">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                    {t("ia.emptyTitle")}
                  </h3>
                  <p className="mt-2 max-w-md text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
                    {t("ia.emptyDesc")}
                  </p>

                  <div className="mt-7 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void handleSend(prompt)}
                        className="apple-press group flex items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 px-4 py-3 text-start text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]/70"
                      >
                        <span className="line-clamp-2">{prompt}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-2xl space-y-6">
                  {messages.map((msg) => {
                    const isThoughtOpen = Boolean(expandedThoughts[msg.id]);
                    const isActionsOpen = Boolean(expandedActions[msg.id]);
                    const actions = msg.proposedActions ?? [];
                    const deselected = deselectedMap[msg.id] ?? {};
                    const selectedCount = actions.filter(
                      (_, idx) => !deselected[idx],
                    ).length;
                    const totalAmount = actions.reduce(
                      (sum, a, idx) =>
                        !deselected[idx] && a.montant ? sum + a.montant : sum,
                      0,
                    );

                    if (msg.role === "user") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[82%] rounded-3xl bg-[var(--muted)] px-4 py-2.5 text-sm leading-relaxed text-[var(--foreground)]">
                            {msg.content}
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
                          <Bot className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-2.5">
                          {/* ChatGPT-style collapsible Thought accordion */}
                          {(msg.thinkingSec ||
                            (msg.toolsUsed && msg.toolsUsed.length > 0)) && (
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedThoughts((prev) => ({
                                    ...prev,
                                    [msg.id]: !prev[msg.id],
                                  }))
                                }
                                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                              >
                                <span>
                                  {msg.toolsUsed && msg.toolsUsed.length > 0
                                    ? t("ia.thoughtSummary", {
                                        count: msg.toolsUsed.length,
                                      })
                                    : t("ia.thoughtFor", {
                                        sec: msg.thinkingSec ?? "1.0",
                                      })}
                                </span>
                                {isThoughtOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <AnimatePresence>
                                {isThoughtOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1.5 overflow-hidden border-s-2 border-[var(--border)] ps-3 text-xs text-[var(--muted-foreground)]"
                                  >
                                    <div className="space-y-1 py-1">
                                      {(msg.toolsUsed ?? []).map((toolName) => (
                                        <div
                                          key={toolName}
                                          className="flex items-center gap-1.5"
                                        >
                                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                          <span>
                                            {t(
                                              TOOL_LABEL_KEYS[toolName] ??
                                                toolName,
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                      {msg.thinkingSec && (
                                        <div className="text-[11px] opacity-75">
                                          {t("ia.thoughtFor", {
                                            sec: msg.thinkingSec,
                                          })}
                                          {msg.provider
                                            ? ` · ${msg.provider}`
                                            : ""}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Clean ChatGPT-style open Markdown prose */}
                          <MarkdownReply content={msg.content} />

                          {msg.isQuotaError && onOpenSubscriptions && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={onOpenSubscriptions}
                                className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                              >
                                <Crown className="h-3.5 w-3.5" />
                                Passer à un abonnement
                              </button>
                            </div>
                          )}

                          {/* Ultra-compact single-bar / batch confirmation */}
                          {actions.length > 0 &&
                            msg.actionState !== "dismissed" && (
                              <div className="pt-1">
                                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 px-3.5 py-2.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2 text-xs">
                                      {actions.length === 1 ? (
                                        <>
                                          <span className="truncate font-semibold text-[var(--foreground)]">
                                            {actions[0].titre}
                                          </span>
                                          {actions[0].montant ? (
                                            <span className="shrink-0 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                              {formatFcfa(actions[0].montant)}
                                            </span>
                                          ) : null}
                                        </>
                                      ) : (
                                        <>
                                          <span className="font-semibold text-[var(--foreground)]">
                                            {t("ia.operationsReady", {
                                              count: selectedCount,
                                            })}
                                          </span>
                                          {totalAmount > 0 && (
                                            <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                              · {formatFcfa(totalAmount)}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setExpandedActions((prev) => ({
                                                ...prev,
                                                [msg.id]: !prev[msg.id],
                                              }))
                                            }
                                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                          >
                                            {t("ia.details")}
                                            {isActionsOpen ? (
                                              <ChevronDown className="h-3 w-3" />
                                            ) : (
                                              <ChevronRight className="h-3 w-3" />
                                            )}
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                      {msg.actionState === "done" ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          {t("ia.actionDone")}
                                        </span>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            disabled={
                                              msg.actionState === "executing" ||
                                              selectedCount === 0
                                            }
                                            onClick={() =>
                                              void handleExecuteActions(
                                                msg.id,
                                                actions,
                                              )
                                            }
                                            className="apple-press inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 text-xs font-semibold text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-45"
                                          >
                                            {msg.actionState === "executing" ? (
                                              <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                {t("ia.phaseExecuting")}
                                              </>
                                            ) : (
                                              <>
                                                <Check className="h-3.5 w-3.5" />
                                                {actions.length === 1
                                                  ? t("ia.confirmExecute")
                                                  : t("ia.confirmCount", {
                                                      count: selectedCount,
                                                    })}
                                              </>
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            disabled={
                                              msg.actionState === "executing"
                                            }
                                            onClick={() =>
                                              handleDismissAction(msg.id)
                                            }
                                            aria-label={t("ia.dismiss")}
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Compact expandable checklist for multi-operation batches */}
                                  <AnimatePresence>
                                    {actions.length > 1 && isActionsOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 max-h-48 space-y-1 overflow-y-auto border-t border-[var(--border)]/70 pt-2"
                                      >
                                        {actions.map((act, idx) => {
                                          const checked = !deselected[idx];
                                          return (
                                            <label
                                              key={`${act.type}-${act.titre}-${idx}`}
                                              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs hover:bg-[var(--muted)]/60"
                                            >
                                              <span className="flex min-w-0 items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  checked={checked}
                                                  disabled={
                                                    msg.actionState === "done"
                                                  }
                                                  onChange={() =>
                                                    toggleActionItem(
                                                      msg.id,
                                                      idx,
                                                    )
                                                  }
                                                  className="h-3.5 w-3.5 rounded accent-indigo-600"
                                                />
                                                <span className="truncate font-medium text-[var(--foreground)]">
                                                  {act.titre}
                                                </span>
                                                <span className="shrink-0 text-[10px] uppercase text-[var(--muted-foreground)]">
                                                  {act.type}
                                                </span>
                                              </span>
                                              {act.montant ? (
                                                <span className="shrink-0 font-semibold tabular-nums text-[var(--foreground)]">
                                                  {formatFcfa(act.montant)}
                                                </span>
                                              ) : null}
                                            </label>
                                          );
                                        })}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* ChatGPT-style minimalist single-line live Thinking indicator */}
                  {chatMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
                        <Bot className="h-3.5 w-3.5 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                        <span>{phaseSteps[thinkingPhase]}</span>
                        <span className="font-mono text-[11px] tabular-nums opacity-70">
                          {(elapsedMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={scrollEndRef} />
                </div>
              )}
            </div>

            {/* Bannière quota atteint avec bouton direction abonnement */}
            {isQuotaExhausted && (
              <div className="px-4 pb-2 sm:px-8">
                <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--foreground)]">
                      Quota quotidien atteint ({quota?.usedToday}/
                      {quota?.dailyLimit} prompts · {quota?.planNom})
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Passez à un pack supérieur pour continuer avec Ndimbeul Bot.
                    </p>
                  </div>
                  {onOpenSubscriptions && (
                    <button
                      type="button"
                      onClick={onOpenSubscriptions}
                      className="apple-press inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      Voir les abonnements
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ChatGPT-style floating pill composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isQuotaExhausted) return;
                void handleSend();
              }}
              className="px-4 pb-4 pt-2 sm:px-8 sm:pb-5"
            >
              <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 shadow-sm focus-within:border-[var(--foreground)]/40">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isQuotaExhausted
                      ? "Quota quotidien atteint — passez à un pack supérieur"
                      : t("ia.placeholder")
                  }
                  disabled={chatMutation.isPending || isQuotaExhausted}
                  className="min-h-[40px] flex-1 bg-transparent px-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                />
                <button
                  type="submit"
                  disabled={
                    !input.trim() || chatMutation.isPending || isQuotaExhausted
                  }
                  aria-label={t("ia.send")}
                  className="apple-press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
