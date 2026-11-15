import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useGoogleLoginMutation } from "@/features/auth/hooks/useAuth";
import { extractApiError } from "@/api/api";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      locale?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onError: (message: string) => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onError,
}) => {
  const { resolvedTheme } = useTheme();
  const googleMutation = useGoogleLoginMutation();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts?.id),
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || scriptReady) return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () =>
      onError("Impossible de charger Google Identity Services.");
    document.head.appendChild(script);
  }, [onError, scriptReady]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !buttonRef.current) return;
    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    buttonRef.current.innerHTML = "";

    gsi.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response.credential) {
          onError("Jeton Google manquant.");
          return;
        }
        try {
          await googleMutation.mutateAsync({ idToken: response.credential });
        } catch (err) {
          const apiErr = extractApiError(err);
          onError(
            Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
          );
        }
      },
    });

    gsi.renderButton(buttonRef.current, {
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 350,
      locale: "fr",
    });
  }, [googleMutation, onError, resolvedTheme, scriptReady]);

  if (GOOGLE_CLIENT_ID && scriptReady) {
    return (
      <div className="relative flex min-h-[44px] w-full items-center justify-center">
        {googleMutation.isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80 backdrop-blur-xs">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <div ref={buttonRef} className="flex w-full justify-center" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onError(
          "Ajoutez VITE_GOOGLE_CLIENT_ID dans votre fichier .env pour activer la connexion Google.",
        )
      }
      className="apple-press flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground shadow-xs hover:bg-muted/50"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
        />
      </svg>
      Continuer avec Google
    </button>
  );
};
