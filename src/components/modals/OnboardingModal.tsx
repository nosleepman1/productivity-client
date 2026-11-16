import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellRing,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Compass,
  Copy,
  FolderKanban,
  GraduationCap,
  HandCoins,
  Laptop,
  Moon,
  PiggyBank,
  ShieldCheck,
  Store,
  Sun,
  Sunset,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  useProfil,
  useUpdateProfilMutation,
} from "@/features/auth/hooks/useProfil";
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications";
import { buildIcsFeedUrl } from "@/features/productivity/utils/calendar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import type {
  ActiviteProfil,
  ObjectifPrincipalProfil,
} from "@/types/auth/profil.types";

export interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

interface ActiviteOption {
  id: ActiviteProfil;
  label: string;
  desc: string;
  Icon: LucideIcon;
}

const ACTIVITES: ActiviteOption[] = [
  {
    id: "ENTREPRENEUR",
    label: "Entrepreneur / Dirigeant",
    desc: "Trésorerie, projets clients et suivi des encaissements",
    Icon: Building2,
  },
  {
    id: "SALARIE",
    label: "Salarié / Cadre",
    desc: "Maîtrise du salaire, épargne mensuelle et organisation",
    Icon: Briefcase,
  },
  {
    id: "COMMERCANT",
    label: "Commerçant / Indépendant",
    desc: "Suivi quotidien des ventes, dettes fournisseurs et créances",
    Icon: Store,
  },
  {
    id: "FREELANCE",
    label: "Freelance / Consultant",
    desc: "Missions livrables, facturation et rythme flexible",
    Icon: Laptop,
  },
  {
    id: "ETUDIANT",
    label: "Étudiant",
    desc: "Budget maîtrisé, révisions, échéances et habitudes",
    Icon: GraduationCap,
  },
  {
    id: "AUTRE",
    label: "Autre profil",
    desc: "Gestion personnelle des finances et des priorités",
    Icon: Compass,
  },
];

interface ObjectifOption {
  id: ObjectifPrincipalProfil;
  label: string;
  desc: string;
  Icon: LucideIcon;
}

const OBJECTIFS: ObjectifOption[] = [
  {
    id: "MAITRISER_DEPENSES",
    label: "Maîtriser mes dépenses",
    desc: "Plafonds mensuels par catégorie et alertes à 80 % et 100 %",
    Icon: Wallet,
  },
  {
    id: "EPARGNER",
    label: "Construire une épargne",
    desc: "Suivi du solde net réel et réduction des sorties imprévues",
    Icon: PiggyBank,
  },
  {
    id: "REMBOURSER_DETTES",
    label: "Recouvrer créances & dettes",
    desc: "Rappels automatiques aux échéances promises et historique",
    Icon: HandCoins,
  },
  {
    id: "ORGANISER_PROJETS",
    label: "Tenir mes projets & délais",
    desc: "Tâches planifiées, rappels progressifs et habitudes",
    Icon: FolderKanban,
  },
];

interface RhythmPreset {
  id: string;
  label: string;
  lever: string;
  descente: string;
  coucher: string;
}

const RHYTHM_PRESETS: RhythmPreset[] = [
  {
    id: "matinal",
    label: "Matinal (06:00 – 21:30)",
    lever: "06:00",
    descente: "17:00",
    coucher: "21:30",
  },
  {
    id: "classique",
    label: "Classique (07:30 – 22:30)",
    lever: "07:30",
    descente: "18:00",
    coucher: "22:30",
  },
  {
    id: "intensif",
    label: "Intensif (07:00 – 23:30)",
    lever: "07:00",
    descente: "19:30",
    coucher: "23:30",
  },
];

const BUDGET_PRESETS = [150000, 300000, 500000, 1000000];

function decalageHeure(hhmm: string, deltaMinutes: number): string {
  const [hStr, mStr] = (hhmm || "07:30").split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = (((h * 60 + m + deltaMinutes) % 1440) + 1440) % 1440;
  const nh = String(Math.floor(total / 60)).padStart(2, "0");
  const nm = String(total % 60).padStart(2, "0");
  return `${nh}:${nm}`;
}

function toMinutes(hhmm: string): number {
  const [hStr, mStr] = (hhmm || "07:30").split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return 450;
  return Math.max(0, Math.min(1439, h * 60 + m));
}

export function OnboardingModal({
  forceOpen = false,
  onClose,
}: OnboardingModalProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profil, isLoading } = useProfil();
  const updateProfil = useUpdateProfilMutation();
  const push = usePushNotifications();

  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [icsCopied, setIcsCopied] = useState(false);

  const [activiteOverride, setActivite] = useState<ActiviteProfil | null>(null);
  const [objectifOverride, setObjectif] =
    useState<ObjectifPrincipalProfil | null>(null);
  const [budgetMensuelOverride, setBudgetMensuel] = useState<string | null>(
    null,
  );
  const [heureLeverOverride, setHeureLever] = useState<string | null>(null);
  const [heureDescenteOverride, setHeureDescente] = useState<string | null>(
    null,
  );
  const [heureCoucherOverride, setHeureCoucher] = useState<string | null>(null);

  const activite: ActiviteProfil =
    activiteOverride ?? profil?.activite ?? "ENTREPRENEUR";
  const objectif: ObjectifPrincipalProfil =
    objectifOverride ?? profil?.objectifPrincipal ?? "MAITRISER_DEPENSES";
  const budgetMensuel: string =
    budgetMensuelOverride ??
    (profil?.budgetMensuelCible ? String(profil.budgetMensuelCible) : "");
  const heureLever: string =
    heureLeverOverride ?? profil?.heureLever ?? "07:30";
  const heureDescente: string =
    heureDescenteOverride ?? profil?.heureDescente ?? "18:00";
  const heureCoucher: string =
    heureCoucherOverride ?? profil?.heureCoucher ?? "22:30";

  const shouldShow =
    forceOpen ||
    (!isLoading && Boolean(profil) && !profil?.onboardingTermine && !dismissed);

  if (!shouldShow) return null;

  const firstName = user?.name?.trim().split(/\s+/)[0] || "vous";
  const icsFeedUrl = buildIcsFeedUrl(profil?.calendrierToken);

  const hBriefingMatin = decalageHeure(heureLever, 30);
  const hPointCreances = decalageHeure(heureLever, 90);
  const hFinTravail = decalageHeure(heureDescente, 15);
  const hBilanSoir = decalageHeure(heureCoucher, -90);

  const minLever = toMinutes(heureLever);
  const minCoucher = toMinutes(heureCoucher);
  const activeStartPct = Math.round((minLever / 1440) * 100);
  const activeWidthPct = Math.max(
    15,
    Math.min(100 - activeStartPct, Math.round(((minCoucher - minLever) / 1440) * 100)),
  );

  const selectedActiviteMeta =
    ACTIVITES.find((a) => a.id === activite) ?? ACTIVITES[0];
  const selectedObjectifMeta =
    OBJECTIFS.find((o) => o.id === objectif) ?? OBJECTIFS[0];

  const handleCopyIcs = async () => {
    if (!icsFeedUrl) return;
    try {
      await navigator.clipboard.writeText(icsFeedUrl);
      setIcsCopied(true);
      setTimeout(() => setIcsCopied(false), 2500);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleSkip = () => {
    setDismissed(true);
    updateProfil.mutate(
      {
        onboardingTermine: true,
        heureLever: profil?.heureLever || "07:30",
        heureDescente: profil?.heureDescente || "18:00",
        heureCoucher: profil?.heureCoucher || "22:30",
      },
      {
        onSuccess: () => {
          toast.info(
            "Configuration standard activée",
            "Lever 07:30 · Fin de journée 18:00 · Coucher 22:30 (modifiable dans Réglages).",
          );
          onClose?.();
        },
      },
    );
  };

  const handleFinish = () => {
    const parsedBudget = Number(budgetMensuel.replace(/\s+/g, ""));
    setDismissed(true);
    updateProfil.mutate(
      {
        activite,
        objectifPrincipal: objectif,
        budgetMensuelCible:
          !Number.isNaN(parsedBudget) && parsedBudget > 0
            ? parsedBudget
            : undefined,
        heureLever,
        heureDescente,
        heureCoucher,
        onboardingTermine: true,
      },
      {
        onSuccess: () => {
          toast.success(
            "Espace calibré sur votre rythme",
            `Briefing à ${hBriefingMatin}, point pro à ${hFinTravail} et bilan à ${hBilanSoir}.`,
          );
          onClose?.();
        },
      },
    );
  };

  const stepsMeta = [
    {
      num: 1 as const,
      title: "Profil & Cap financier",
      subtitle: "Activité et priorité principale",
    },
    {
      num: 2 as const,
      title: "Architecture de la journée",
      subtitle: "Horaires de briefings et silence nocturne",
    },
    {
      num: 3 as const,
      title: "Canaux & Synchronisation",
      subtitle: "Notifications Push et Agenda .ics",
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-border/80 bg-card shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl lg:grid lg:grid-cols-12"
        >
          {/* PANNEAU GAUCHE : Synthèse temps réel & Progression (38% sur desktop) */}
          <aside className="relative flex flex-col justify-between bg-slate-950 p-5 text-white sm:p-6 lg:col-span-5">
            <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-200 ring-1 ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("onboarding.badge")}
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                >
                  {t("common.skip")}
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2
                id="onboarding-title"
                className="mt-3 text-xl font-bold tracking-tight text-balance sm:text-2xl"
              >
                {t("dashboard.greeting", { name: firstName })}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300 text-pretty">
                Adaptons vos rappels, votre suivi de trésorerie et vos heures de
                silence à votre véritable emploi du temps.
              </p>

              {/* Indicateur d'étapes structuré */}
              <nav aria-label="Étapes de configuration" className="mt-5">
                <ol className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-2.5">
                  {stepsMeta.map((s) => {
                    const isActive = step === s.num;
                    const isDone = step > s.num;
                    return (
                      <li key={s.num}>
                        <button
                          type="button"
                          onClick={() => setStep(s.num)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors",
                            isActive
                              ? "bg-white/12 text-white ring-1 ring-white/20"
                              : isDone
                                ? "bg-white/5 text-slate-200 hover:bg-white/10"
                                : "text-slate-400 hover:bg-white/5",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums",
                              isActive
                                ? "bg-indigo-500 text-white"
                                : isDone
                                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                                  : "bg-white/10 text-slate-400",
                            )}
                          >
                            {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">
                              {s.title}
                            </p>
                            <p className="hidden truncate text-[11px] text-slate-400 lg:block">
                              {s.subtitle}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            {/* Carte d'aperçu en direct du profil configuré */}
            <div className="relative mt-5 hidden rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur-xs lg:block">
              <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <span>Synthèse en direct</span>
                <span className="text-emerald-400 tabular-nums">
                  {heureLever} – {heureCoucher}
                </span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Profil</span>
                  <span className="font-semibold text-white">
                    {selectedActiviteMeta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Priorité</span>
                  <span className="font-semibold text-indigo-300">
                    {selectedObjectifMeta.label}
                  </span>
                </div>
                {budgetMensuel && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Plafond mensuel</span>
                    <span className="font-semibold text-emerald-300 tabular-nums">
                      {Number(budgetMensuel).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}
              </div>

              {/* Barre temporelle 24h */}
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                  <span>00:00</span>
                  <span className="text-indigo-300">
                    Fenêtre active ({heureLever} – {heureCoucher})
                  </span>
                  <span>24:00</span>
                </div>
                <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300"
                    style={{
                      left: `${activeStartPct}%`,
                      width: `${activeWidthPct}%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Silence complet garanti de {heureCoucher} à {heureLever}.
                </p>
              </div>
            </div>
          </aside>

          {/* PANNEAU DROIT : Contenu interactif de l'étape */}
          <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden bg-card lg:col-span-7">
            {/* Barre supérieure desktop */}
            <div className="hidden items-center justify-between border-b border-border/60 px-6 py-3.5 lg:flex">
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                Étape {step} sur 3 — {stepsMeta[step - 1].title}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Passer (horaires par défaut)
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zone scrollable de l'étape active */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2.5 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        1. Quelle est votre activité principale ?
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ACTIVITES.map((item) => {
                          const selected = activite === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setActivite(item.id)}
                              className={cn(
                                "apple-press flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                                selected
                                  ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                                  : "border-border/80 bg-background hover:border-primary/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                                  selected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <item.Icon className="h-4.5 w-4.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="truncate text-xs font-bold text-foreground">
                                    {item.label}
                                  </p>
                                  {selected && (
                                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2.5 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        <Wallet className="h-3.5 w-3.5 text-primary" />
                        2. Quelle est votre priorité numéro 1 ?
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {OBJECTIFS.map((obj) => {
                          const selected = objectif === obj.id;
                          return (
                            <button
                              key={obj.id}
                              type="button"
                              onClick={() => setObjectif(obj.id)}
                              className={cn(
                                "apple-press flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                                selected
                                  ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                                  : "border-border/80 bg-background hover:border-primary/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                  selected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <obj.Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground">
                                  {obj.label}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                  {obj.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-background p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="onboarding-budget"
                          className="text-xs font-bold text-foreground"
                        >
                          Plafond mensuel de dépenses souhaité (FCFA)
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          Optionnel
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {BUDGET_PRESETS.map((preset) => {
                          const isSelected =
                            Number(budgetMensuel) === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setBudgetMensuel(String(preset))}
                              className={cn(
                                "rounded-xl border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition-colors",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {preset.toLocaleString("fr-FR")} FCFA
                            </button>
                          );
                        })}
                      </div>
                      <input
                        id="onboarding-budget"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={5000}
                        placeholder="Ou saisissez un montant libre (ex: 250000)"
                        value={budgetMensuel}
                        onChange={(e) => setBudgetMensuel(e.target.value)}
                        className="mt-2.5 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground tabular-nums focus:border-primary focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    {/* Préréglages rapides */}
                    <div>
                      <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Profils horaires rapides
                      </span>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {RHYTHM_PRESETS.map((preset) => {
                          const isCurrent =
                            heureLever === preset.lever &&
                            heureDescente === preset.descente &&
                            heureCoucher === preset.coucher;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setHeureLever(preset.lever);
                                setHeureDescente(preset.descente);
                                setHeureCoucher(preset.coucher);
                              }}
                              className={cn(
                                "apple-press rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                                isCurrent
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/80 bg-background text-foreground hover:border-primary/40",
                              )}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3 Contrôles horaires */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Sun className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Heure de réveil
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Briefing matinal envoyé à{" "}
                              <strong className="text-foreground tabular-nums">
                                {hBriefingMatin}
                              </strong>{" "}
                              · Point échéances à{" "}
                              <strong className="text-foreground tabular-nums">
                                {hPointCreances}
                              </strong>
                            </p>
                          </div>
                        </div>
                        <input
                          type="time"
                          aria-label="Heure de réveil"
                          value={heureLever}
                          onChange={(e) => setHeureLever(e.target.value)}
                          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground tabular-nums focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <Sunset className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Fin de journée de travail
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Point sur les tâches restantes à{" "}
                              <strong className="text-foreground tabular-nums">
                                {hFinTravail}
                              </strong>
                            </p>
                          </div>
                        </div>
                        <input
                          type="time"
                          aria-label="Heure de fin de travail"
                          value={heureDescente}
                          onChange={(e) => setHeureDescente(e.target.value)}
                          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground tabular-nums focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <Moon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Heure de coucher
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Journal des dépenses à{" "}
                              <strong className="text-foreground tabular-nums">
                                {hBilanSoir}
                              </strong>{" "}
                              puis silence nocturne
                            </p>
                          </div>
                        </div>
                        <input
                          type="time"
                          aria-label="Heure de coucher"
                          value={heureCoucher}
                          onChange={(e) => setHeureCoucher(e.target.value)}
                          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground tabular-nums focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Récapitulatif visuel des 4 créneaux */}
                    <div className="rounded-2xl border border-border/70 bg-muted/35 p-3.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Vos 4 rendez-vous quotidiens + alerte budget temps réel (5 notifications)</span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { time: hBriefingMatin, label: "Briefing matin" },
                          { time: hPointCreances, label: "Dettes & Créances" },
                          { time: hFinTravail, label: "Bilan tâches pro" },
                          { time: hBilanSoir, label: "Journal dépenses" },
                        ].map((slot) => (
                          <div
                            key={slot.label}
                            className="rounded-xl border border-border/60 bg-card px-2.5 py-2 text-center"
                          >
                            <p className="text-sm font-extrabold text-primary tabular-nums">
                              {slot.time}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                              {slot.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    {/* Carte Push PWA */}
                    <div className="rounded-2xl border border-border/80 bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                            <BellRing className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Notifications Push sur cet appareil
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {push.isSubscribed
                                ? "Votre appareil reçoit les rappels même lorsque l'application est fermée."
                                : "Activez le canal Push pour recevoir vos briefings et échéances en temps réel."}
                            </p>
                          </div>
                        </div>

                        {push.isSupported && (
                          <button
                            type="button"
                            disabled={push.isPending}
                            onClick={() =>
                              push.isSubscribed ? push.disable() : push.enable()
                            }
                            className={cn(
                              "apple-press shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors",
                              push.isSubscribed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-primary text-primary-foreground",
                            )}
                          >
                            {push.isPending
                              ? "Activation..."
                              : push.isSubscribed
                                ? "Activé"
                                : "Activer"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Carte Synchronisation Google Calendar / Apple Calendrier */}
                    <div className="rounded-2xl border border-border/80 bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground">
                              Flux Agenda universel (.ics)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Compatible Google Calendar, Apple Calendrier et
                              Outlook (avec ou sans connexion Google).
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!icsFeedUrl}
                          onClick={handleCopyIcs}
                          className="apple-press inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          {icsCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copier le lien
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Garanties Anti-Spam */}
                    <div className="rounded-2xl border border-border/70 bg-muted/35 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Politique de notification stricte (zéro spam)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>
                            Rappels d&apos;échéances progressifs : Jour J, -10h,
                            -5h, -2h, -1h, -30min, -5min.
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>
                            Arrêt immédiat des rappels dès qu&apos;une tâche ou
                            un projet est marqué terminé.
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>
                            Remplacement intelligent de la bannière précédente
                            sur mobile (aucun empilement).
                          </span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pied de modale : Navigation entre les étapes */}
            <div className="flex items-center justify-between gap-3 border-t border-border/70 bg-card px-5 py-4 sm:px-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("common.back")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("common.skip")}
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
                >
                  {t("common.next")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updateProfil.isPending}
                  onClick={handleFinish}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {updateProfil.isPending
                    ? t("common.saving")
                    : t("common.finish")}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
