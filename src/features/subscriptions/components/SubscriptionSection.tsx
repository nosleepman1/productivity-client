import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  ExternalLink,
  RefreshCw,
  Smartphone,
  XCircle,
  Zap,
} from "lucide-react";
import { extractApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/store/toast.store";
import type {
  MethodePaiementAbonnement,
  PaiementAbonnement,
  PlanAbonnement,
} from "../api/subscriptions.api";
import {
  useInitiatePaymentMutation,
  useMySubscription,
  usePaymentMethods,
  useSubscriptionPlans,
} from "../hooks/useSubscriptions";

const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: "Confirmé",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  PAID: {
    label: "Payé",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  PENDING_VERIFICATION: {
    label: "En vérification",
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  PENDING: {
    label: "En attente",
    className:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: "Rejeté",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  FAILED: {
    label: "Échoué",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    label: "Annulé",
    className: "bg-muted text-muted-foreground border-border",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

function formatDateShort(iso?: string | null): string {
  if (!iso) return "Illimité";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export const SubscriptionSection: React.FC = () => {
  const plansQuery = useSubscriptionPlans();
  const mySubQuery = useMySubscription();
  const methodsQuery = usePaymentMethods();
  const initiatePayment = useInitiatePaymentMutation();

  const [selectedPlan, setSelectedPlan] = useState<PlanAbonnement | null>(null);
  const [methode, setMethode] =
    useState<MethodePaiementAbonnement>("MANUAL_WAVE");
  const [telephonePayeur, setTelephonePayeur] = useState("");
  const [referenceExterne, setReferenceExterne] = useState("");
  const [preuveNote, setPreuveNote] = useState("");
  const [checkoutResult, setCheckoutResult] = useState<{
    instructions?: string | null;
    checkoutUrl?: string | null;
    statut?: string;
    referenceExterne?: string | null;
  } | null>(null);

  const summary = mySubQuery.data;
  const plans = plansQuery.data ?? [];
  const quota = summary?.quota;
  const currentPlanCode = summary?.plan?.code ?? quota?.planCode ?? "FREE";

  const quotaPct = useMemo(() => {
    if (!quota || quota.dailyLimit <= 0) return 100;
    return Math.min(100, Math.round((quota.usedToday / quota.dailyLimit) * 100));
  }, [quota]);

  const quotaBarColor =
    quotaPct >= 100
      ? "bg-rose-500"
      : quotaPct >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  const isMethodConfigured = (m: MethodePaiementAbonnement) => {
    const found = methodsQuery.data?.find((item) => item.methode === m);
    return found ? found.configured : true;
  };

  const handleSelectPlan = (plan: PlanAbonnement) => {
    setSelectedPlan(plan);
    setCheckoutResult(null);
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (
      methode === "MANUAL_WAVE" &&
      !telephonePayeur.trim() &&
      !referenceExterne.trim()
    ) {
      toast.error(
        "Indiquez votre numéro Wave ou la référence du transfert pour la vérification.",
      );
      return;
    }

    try {
      const res = await initiatePayment.mutateAsync({
        planId: selectedPlan.id,
        methode,
        telephonePayeur: telephonePayeur.trim() || undefined,
        referenceExterne: referenceExterne.trim() || undefined,
        preuveNote: preuveNote.trim() || undefined,
      });

      setCheckoutResult({
        instructions: res.checkout?.instructions,
        checkoutUrl: res.checkout?.checkoutUrl ?? res.payment.checkoutUrl,
        statut: res.checkout?.statut ?? res.payment.statut,
        referenceExterne:
          res.checkout?.referenceExterne ?? res.payment.referenceExterne,
      });

      if (methode === "MANUAL_WAVE") {
        toast.success(
          "Demande envoyée. Un administrateur validera votre transfert Wave sous peu.",
        );
      } else {
        toast.success("Session de paiement DexPay initiée.");
      }

      setReferenceExterne("");
      setPreuveNote("");
    } catch (err) {
      const apiErr = extractApiError(err);
      const msg = Array.isArray(apiErr.message)
        ? apiErr.message[0]
        : apiErr.message;
      toast.error(msg || "Impossible d'initier le paiement.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Résumé du pack actif + jauge quota IA */}
      <Card className="apple-surface border-border/80 bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Pack actuel : {summary?.plan?.nom ?? "Gratuit"}
                </h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {currentPlanCode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.abonnement?.finAt
                  ? `Actif jusqu'au ${formatDateShort(summary.abonnement.finAt)}`
                  : "Pack de base sans expiration"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void mySubQuery.refetch()}
            className="apple-press inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${mySubQuery.isFetching ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>

        {/* Jauge Quota IA */}
        {quota && (
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/25 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Quota Salma IA aujourd&apos;hui
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {quota.usedToday} / {quota.dailyLimit} prompts
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${quotaBarColor}`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {quota.remainingToday > 0
                ? `${quota.remainingToday} prompt${quota.remainingToday > 1 ? "s" : ""} restant${quota.remainingToday > 1 ? "s" : ""} aujourd'hui.`
                : "Quota quotidien atteint. Choisissez un pack supérieur ci-dessous pour débloquer plus de prompts."}
            </p>
          </div>
        )}
      </Card>

      {/* 2. Packs disponibles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Packs d&apos;abonnement
          </h4>
        </div>

        {plansQuery.isLoading ? (
          <Card className="apple-surface border-border/80 bg-card p-4 text-xs text-muted-foreground">
            Chargement des offres...
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.code === currentPlanCode;
              const isSelected = selectedPlan?.id === plan.id;
              const isFree = plan.prixFcfa <= 0;

              return (
                <Card
                  key={plan.id}
                  className={`apple-surface flex flex-col justify-between border p-4 transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 bg-card"
                      : isCurrent
                        ? "border-emerald-500/40 bg-card"
                        : "border-border/80 bg-card"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {plan.nom}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Actif
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold tabular-nums text-foreground">
                        {plan.prixFcfa.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {plan.devise} / {plan.dureeJours}j
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-medium text-primary">
                      {plan.quotaIaJour} prompts IA / jour
                    </p>

                    {plan.description && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                        {plan.description}
                      </p>
                    )}

                    {Array.isArray(plan.avantages) &&
                      plan.avantages.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {plan.avantages.map((adv, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                            >
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <div className="mt-4">
                    {isFree ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full text-xs"
                      >
                        {isCurrent ? "Pack actuel" : "Inclus par défaut"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full text-xs"
                      >
                        {isSelected
                          ? "Sélectionné"
                          : isCurrent
                            ? "Renouveler ce pack"
                            : "Choisir ce pack"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tunnel de paiement (Wave Manuel ou DexPay Sandbox) */}
      {selectedPlan && selectedPlan.prixFcfa > 0 && (
        <Card className="apple-surface border-primary/40 bg-card p-4">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Paiement — Pack {selectedPlan.nom}
              </h4>
              <p className="text-xs text-muted-foreground">
                Montant à régler :{" "}
                <span className="font-semibold text-foreground">
                  {selectedPlan.prixFcfa.toLocaleString("fr-FR")}{" "}
                  {selectedPlan.devise}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </button>
          </div>

          {/* Sélecteur méthode */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMethode("MANUAL_WAVE");
                setCheckoutResult(null);
              }}
              className={`apple-press flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                methode === "MANUAL_WAVE"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <Smartphone className="h-4 w-4 shrink-0 text-sky-500" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Wave (Vérification manuelle)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Transfert direct puis validation admin
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethode("DEXPAY_SANDBOX");
                setCheckoutResult(null);
              }}
              className={`apple-press flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                methode === "DEXPAY_SANDBOX"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <CreditCard className="h-4 w-4 shrink-0 text-indigo-500" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  DexPay (Mode Sandbox)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isMethodConfigured("DEXPAY_SANDBOX")
                    ? "Lien de paiement en ligne automatique"
                    : "Passerelle Sandbox disponible"}
                </p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmitCheckout} className="mt-4 space-y-3">
            {methode === "MANUAL_WAVE" ? (
              <>
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-foreground">
                  <p className="font-semibold">Instructions Wave :</p>
                  <p className="mt-1 text-muted-foreground">
                    1. Effectuez un transfert Wave de{" "}
                    <strong className="text-foreground">
                      {selectedPlan.prixFcfa.toLocaleString("fr-FR")} FCFA
                    </strong>
                    .<br />
                    2. Renseignez votre numéro Wave et/ou l&apos;ID de
                    transaction ci-dessous.
                    <br />
                    3. L&apos;administrateur vérifie la réception et active
                    votre pack.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">
                      Numéro Wave payeur
                    </label>
                    <Input
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={telephonePayeur}
                      onChange={(e) => setTelephonePayeur(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">
                      Référence transaction Wave
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: T_ABC123XYZ"
                      value={referenceExterne}
                      onChange={(e) => setReferenceExterne(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Note / précision (optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Envoyé depuis le compte Wave de..."
                    value={preuveNote}
                    onChange={(e) => setPreuveNote(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Téléphone client (optionnel pour DexPay)
                </label>
                <Input
                  type="tel"
                  placeholder="Ex: +221771234567"
                  value={telephonePayeur}
                  onChange={(e) => setTelephonePayeur(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={initiatePayment.isPending}
              >
                {initiatePayment.isPending
                  ? "Traitement en cours..."
                  : methode === "MANUAL_WAVE"
                    ? "Soumettre la preuve Wave"
                    : "Lancer le paiement DexPay"}
              </Button>
            </div>
          </form>

          {/* Résultat du checkout */}
          {checkoutResult && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">
                    Demande enregistrée
                    {checkoutResult.referenceExterne
                      ? ` (Réf: ${checkoutResult.referenceExterne})`
                      : ""}
                  </p>
                  {checkoutResult.instructions && (
                    <p className="text-muted-foreground">
                      {checkoutResult.instructions}
                    </p>
                  )}
                  {checkoutResult.checkoutUrl && (
                    <a
                      href={checkoutResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Ouvrir la page de paiement DexPay
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 4. Historique des paiements */}
      {summary?.paiements && summary.paiements.length > 0 && (
        <Card className="apple-surface border-border/80 bg-card p-0 overflow-hidden">
          <div className="border-b border-border/70 px-4 py-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Historique de mes paiements
            </h4>
          </div>
          <div className="divide-y divide-border/70">
            {summary.paiements.map((p: PaiementAbonnement) => {
              const statusInfo =
                PAYMENT_STATUS_META[p.statut] ?? PAYMENT_STATUS_META.PENDING;

              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {p.plan?.nom ?? "Abonnement"} —{" "}
                      {p.montantFcfa.toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.methode === "MANUAL_WAVE" ? "Wave Manuel" : "DexPay"}{" "}
                      · {formatDateShort(p.createdAt)}
                      {p.referenceExterne ? ` · Réf ${p.referenceExterne}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.checkoutUrl && p.statut === "PENDING" && (
                      <a
                        href={p.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                      >
                        Payer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
