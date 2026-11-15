import React from "react";
import { Check, Circle } from "lucide-react";
import { motion } from "motion/react";
import { PASSWORD_RULES } from "../utils/password";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
}) => {
  const passedCount = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const ratio = passedCount / PASSWORD_RULES.length;

  const barColor =
    passedCount <= 2
      ? "bg-destructive"
      : passedCount <= 4
        ? "bg-[var(--idea)]"
        : "bg-[var(--finance)]";

  return (
    <div className="space-y-2 pt-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(ratio * 100)}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <span
              key={rule.id}
              className={`inline-flex items-center gap-1 text-[11px] transition-colors duration-150 ${
                ok
                  ? "text-[var(--finance)] font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {ok ? (
                <Check className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <Circle className="h-2.5 w-2.5 opacity-50" />
              )}
              {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};
