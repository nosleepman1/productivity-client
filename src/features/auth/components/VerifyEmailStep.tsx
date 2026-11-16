import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services";
import { extractApiError } from "@/api/api";
import {
  extractFieldErrors,
  verifyEmailSchema,
} from "../schemas/auth.schema";

interface VerifyEmailStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const VerifyEmailStep: React.FC<VerifyEmailStepProps> = ({
  email,
  onVerified,
  onBack,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyEmailSchema.safeParse({ email, code });
    if (!parsed.success) {
      const fields = extractFieldErrors<"email" | "code">(parsed.error);
      setError(fields.code ?? fields.email ?? "Code invalide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(parsed.data);
      setDone(true);
      setTimeout(onVerified, 900);
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await authService.resendVerification({ email });
      setCooldown(30);
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    } finally {
      setResending(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center py-6 text-center space-y-3"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--finance)]/15 text-[var(--finance)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Adresse vérifiée
        </h3>
        <p className="text-xs text-muted-foreground">
          Vous pouvez maintenant vous connecter à votre espace.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="apple-press inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground min-h-[36px]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </button>

      <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <MailCheck className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-foreground">Vérifiez votre boîte mail</p>
          <p className="text-muted-foreground mt-0.5">
            Un code a été envoyé à <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground block">
          Code de vérification
        </label>
        <Input
          required
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="h-11 text-center text-base font-semibold tracking-[0.25em] tabular-nums"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || code.trim().length !== 6}
        className="apple-press h-11 w-full rounded-xl text-sm font-semibold"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Confirmer mon email"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary disabled:text-muted-foreground tabular-nums min-h-[36px]"
        >
          <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
          {cooldown > 0
            ? `Renvoyer le code (${cooldown}s)`
            : "Renvoyer le code"}
        </button>
      </div>
    </motion.form>
  );
};
