import { cn } from "@/lib/utils";

export interface LoadingPersonProps {
  label?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Illustration vectorielle animée d'une personne en train d'organiser ses tâches et finances.
 * Zéro dépendance externe : rendu instantané à 60 fps.
 */
export function LoadingPerson({
  label = "Synchronisation de votre espace...",
  compact = false,
  className,
}: LoadingPersonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-6" : "min-h-[42vh] py-10",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative", compact ? "w-28 h-24" : "w-36 h-32")}>
        <svg
          viewBox="0 0 180 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          <style>{`
            @keyframes lp-bob {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-2.5px); }
            }
            @keyframes lp-hand {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-1.8px); }
            }
            @keyframes lp-float {
              0%, 100% { transform: translateY(0px); opacity: 0.92; }
              50% { transform: translateY(-5px); opacity: 1; }
            }
            @keyframes lp-pulse {
              0%, 100% { opacity: 0.45; }
              50% { opacity: 0.95; }
            }
            .lp-head { animation: lp-bob 2.2s ease-in-out infinite; transform-origin: 90px 44px; }
            .lp-hand-l { animation: lp-hand 0.55s ease-in-out infinite; }
            .lp-hand-r { animation: lp-hand 0.55s ease-in-out 0.27s infinite; }
            .lp-card-1 { animation: lp-float 2.6s ease-in-out infinite; }
            .lp-card-2 { animation: lp-float 2.6s ease-in-out 0.9s infinite; }
            .lp-screen-glow { animation: lp-pulse 1.6s ease-in-out infinite; }
          `}</style>

          {/* Halo discret */}
          <ellipse
            cx="90"
            cy="132"
            rx="64"
            ry="7"
            className="fill-indigo-500/12 dark:fill-indigo-400/15"
          />

          {/* Carte flottante gauche (tâche cochée) */}
          <g className="lp-card-1">
            <rect
              x="16"
              y="30"
              width="34"
              height="24"
              rx="7"
              className="fill-card stroke-border"
              strokeWidth="1.5"
            />
            <circle cx="26" cy="42" r="5" className="fill-emerald-500/20" />
            <path
              d="M23.5 42L25.2 43.8L28.5 40.2"
              className="stroke-emerald-500"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="34"
              y="39"
              width="11"
              height="2.5"
              rx="1.25"
              className="fill-muted-foreground/45"
            />
            <rect
              x="34"
              y="44"
              width="8"
              height="2.5"
              rx="1.25"
              className="fill-muted-foreground/25"
            />
          </g>

          {/* Carte flottante droite (courbe finance) */}
          <g className="lp-card-2">
            <rect
              x="130"
              y="26"
              width="36"
              height="25"
              rx="7"
              className="fill-card stroke-border"
              strokeWidth="1.5"
            />
            <path
              d="M137 44L143 38L148 41L158 33"
              className="stroke-indigo-500"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="158" cy="33" r="2.2" className="fill-emerald-500" />
          </g>

          {/* Buste & Épaules */}
          <path
            d="M58 112C58 92 71 80 90 80C109 80 122 92 122 112"
            className="fill-indigo-600 dark:fill-indigo-500"
          />
          <path
            d="M81 80L90 91L99 80"
            className="stroke-white/80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tête animée */}
          <g className="lp-head">
            <rect x="85" y="68" width="10" height="14" rx="5" fill="#E8B998" />
            <circle cx="90" cy="54" r="17" fill="#F2C6A5" />
            {/* Cheveux */}
            <path
              d="M73 51C73 40 81 33 91 33C101 33 107 40 107 49C103 44 97 42 90 42C82 42 77 45 73 51Z"
              className="fill-slate-900 dark:fill-slate-800"
            />
            {/* Yeux concentrés */}
            <circle cx="84.5" cy="55" r="1.6" className="fill-slate-900" />
            <circle cx="95.5" cy="55" r="1.6" className="fill-slate-900" />
            {/* Sourire léger */}
            <path
              d="M86.5 61.5C88.5 63.2 91.5 63.2 93.5 61.5"
              className="stroke-slate-800"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Bureau */}
          <rect
            x="28"
            y="112"
            width="124"
            height="7"
            rx="3.5"
            className="fill-slate-300 dark:fill-slate-700"
          />
          <rect
            x="42"
            y="119"
            width="5"
            height="13"
            rx="2.5"
            className="fill-slate-300/70 dark:fill-slate-700/70"
          />
          <rect
            x="133"
            y="119"
            width="5"
            height="13"
            rx="2.5"
            className="fill-slate-300/70 dark:fill-slate-700/70"
          />

          {/* Ordinateur portable */}
          <path
            d="M66 86C66 83.8 67.8 82 70 82H110C112.2 82 114 83.8 114 86V112H66V86Z"
            className="fill-slate-800 dark:fill-slate-900 stroke-slate-600"
            strokeWidth="1.5"
          />
          {/* Reflet écran animé */}
          <rect
            x="72"
            y="89"
            width="36"
            height="16"
            rx="3"
            className="lp-screen-glow fill-indigo-400/25"
          />
          <rect
            x="85"
            y="95"
            width="10"
            height="4"
            rx="2"
            className="fill-white/60"
          />

          {/* Mains qui tapent */}
          <circle cx="66" cy="110" r="4.5" fill="#F2C6A5" className="lp-hand-l" />
          <circle cx="114" cy="110" r="4.5" fill="#F2C6A5" className="lp-hand-r" />
        </svg>
      </div>

      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
