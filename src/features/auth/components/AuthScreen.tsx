import React, { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/features/auth/hooks/useAuth";
import { extractApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "./PasswordStrength";
import {
  extractFieldErrors,
  loginSchema,
  registerSchema,
  type FieldErrors,
} from "../schemas/auth.schema";
import { VerifyEmailStep } from "./VerifyEmailStep";
import { ForgotPasswordStep } from "./ForgotPasswordStep";
import { GoogleSignInButton } from "./GoogleSignInButton";

type AuthView = "login" | "register" | "verify" | "forgot";

export const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<"name" | "email" | "password">
  >({});
  const [banner, setBanner] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const switchMode = (next: "login" | "register") => {
    setView(next);
    setError(null);
    setFieldErrors({});
    setBanner(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setBanner(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(extractFieldErrors<"email" | "password">(parsed.error));
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      await loginMutation.mutateAsync(parsed.data);
    } catch (err) {
      const apiErr = extractApiError(err);
      const msg = Array.isArray(apiErr.message)
        ? apiErr.message[0]
        : apiErr.message;

      if (
        apiErr.code === "EMAIL_NON_VERIFIE" ||
        msg.toLowerCase().includes("vérifi")
      ) {
        setView("verify");
        return;
      }
      triggerError(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setBanner(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setFieldErrors(
        extractFieldErrors<"name" | "email" | "password">(parsed.error),
      );
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      await registerMutation.mutateAsync(parsed.data);
      setView("verify");
    } catch (err) {
      const apiErr = extractApiError(err);
      const msg = Array.isArray(apiErr.message)
        ? apiErr.message[0]
        : apiErr.message;
      triggerError(msg);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
        {/* Top-right subtle theme toggle */}
        <div className="fixed top-4 right-4 z-20">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="apple-press flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/80 text-foreground shadow-xs backdrop-blur-md hover:bg-accent"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          {/* App Identity Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="flex flex-col items-center text-center space-y-2.5"
          >
            <motion.img
              src="/favicon.svg"
              alt="Ndimbeul"
              className="h-14 w-14 rounded-[16px] shadow-md"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Ndimbeul
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("auth.appTagline")}
              </p>
            </div>
          </motion.div>

          {/* Main Animated Auth Card */}
          <motion.div
            layout
            key={shakeKey}
            initial={{ opacity: 0, y: 12 }}
            animate={
              shakeKey > 0
                ? { opacity: 1, y: 0, x: [-6, 6, -4, 4, 0] }
                : { opacity: 1, y: 0 }
            }
            transition={{
              layout: { type: "spring", stiffness: 320, damping: 30 },
              x: { duration: 0.32 },
            }}
            className="apple-surface rounded-3xl border border-border/80 bg-card p-6"
          >
            {/* Segmented Pill for Login / Register */}
            {(view === "login" || view === "register") && (
              <div className="relative mb-6 grid grid-cols-2 rounded-2xl bg-muted p-1">
                {(["login", "register"] as const).map((tab) => {
                  const active = view === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => switchMode(tab)}
                      className={`relative z-10 h-9 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="auth-tab-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          className="absolute inset-0 -z-10 rounded-xl bg-card shadow-xs"
                        />
                      )}
                      {tab === "login" ? t("auth.loginTab") : t("auth.registerTab")}
                    </button>
                  );
                })}
              </div>
            )}

            {banner && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-[var(--finance)]/12 px-3 py-2 text-xs font-medium text-[var(--finance)]"
              >
                {banner}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.form
                  key="login"
                  noValidate
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 rounded-xl"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">
                        {t("auth.password")}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setView("forgot");
                        }}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        {t("auth.forgotShort")}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                        className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="apple-press h-11 w-full rounded-xl text-sm font-semibold gap-2"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {t("auth.signIn")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {view === "register" && (
                <motion.form
                  key="register"
                  noValidate
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      {t("auth.fullName")}
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        required
                        type="text"
                        autoComplete="name"
                        placeholder="Abdallah Diouf"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 pl-10 rounded-xl"
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 rounded-xl"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                        className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <PasswordStrength password={password} />
                    )}
                    {fieldErrors.password && (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="apple-press h-11 w-full rounded-xl text-sm font-semibold gap-2"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {t("auth.signUp")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {view === "verify" && (
                <VerifyEmailStep
                  key="verify"
                  email={email.trim()}
                  onVerified={() => {
                    setBanner(t("auth.emailVerifiedBanner"));
                    setView("login");
                  }}
                  onBack={() => setView("login")}
                />
              )}

              {view === "forgot" && (
                <ForgotPasswordStep
                  key="forgot"
                  initialEmail={email.trim()}
                  onResetSuccess={() => {
                    setBanner(t("auth.passwordResetBanner"));
                    setView("login");
                  }}
                  onBack={() => setView("login")}
                />
              )}
            </AnimatePresence>

            {(view === "login" || view === "register") && (
              <div className="mt-5 space-y-4">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-border/80" />
                  <span className="mx-3 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("auth.or")}
                  </span>
                  <div className="flex-grow border-t border-border/80" />
                </div>
                <GoogleSignInButton onError={triggerError} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
};
