import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services";
import { extractApiError } from "@/api/api";
import { PasswordStrength } from "./PasswordStrength";
import { isStrongPassword } from "../utils/password";

interface ForgotPasswordStepProps {
  initialEmail?: string;
  onResetSuccess: () => void;
  onBack: () => void;
}

export const ForgotPasswordStep: React.FC<ForgotPasswordStepProps> = ({
  initialEmail = "",
  onResetSuccess,
  onBack,
}) => {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setStep("confirm");
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword(newPassword)) {
      setError("Veuillez respecter tous les critères du mot de passe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        email: email.trim(),
        code: code.trim(),
        nouveauMotDePasse: newPassword,
      });
      onResetSuccess();
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={step === "confirm" ? () => setStep("request") : onBack}
        className="apple-press inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground min-h-[36px]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </button>

      <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <KeyRound className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-foreground">
            {step === "request"
              ? "Mot de passe oublié"
              : "Nouveau mot de passe"}
          </p>
          <p className="text-muted-foreground mt-0.5">
            {step === "request"
              ? "Recevez un code de réinitialisation par email."
              : `Saisissez le code envoyé à ${email}.`}
          </p>
        </div>
      </div>

      {step === "request" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Adresse email
            </label>
            <Input
              required
              type="email"
              autoComplete="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="apple-press h-11 w-full rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Envoyer le code"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Code reçu
            </label>
            <Input
              required
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-11 text-center text-base font-semibold tracking-[0.25em] tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Nouveau mot de passe
            </label>
            <Input
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11"
            />
            {newPassword.length > 0 && (
              <PasswordStrength password={newPassword} />
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || code.trim().length < 4}
            className="apple-press h-11 w-full rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </form>
      )}
    </motion.div>
  );
};
