import React, { useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import { extractApiError } from "@/api/api";
import {
  FORM_INPUT_CLASS,
  FORM_SELECT_CLASS,
  FORM_TEXTAREA_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import {
  useProfil,
  useUpdateProfilMutation,
} from "@/features/auth/hooks/useProfil";
import {
  PROFIL_LANGUES,
  updateProfilSchema,
} from "@/features/auth/schemas/profil.schema";
import { cn } from "@/lib/utils";
import type { LangueProfil, Profil } from "@/types/auth";

/** Propriétés de la modale d'édition du profil utilisateur. */
export interface ProfilEditModalProps {
  /** Contrôle l'ouverture de la modale. */
  open: boolean;
  /** Met à jour l'état d'ouverture. */
  onOpenChange: (open: boolean) => void;
}

import { setAppLanguage } from "@/i18n";

const LANGUE_LABELS: Record<LangueProfil, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  wo: "Wolof",
};

interface ProfilFormProps {
  initialProfil?: Profil;
  onClose: () => void;
}

const ProfilForm: React.FC<ProfilFormProps> = ({ initialProfil, onClose }) => {
  const updateMutation = useUpdateProfilMutation();

  const [telephone, setTelephone] = useState(initialProfil?.telephone ?? "");
  const [langue, setLangue] = useState<LangueProfil>(
    initialProfil?.langue ?? "fr",
  );
  const [fuseauHoraire, setFuseauHoraire] = useState(
    initialProfil?.fuseauHoraire || "Africa/Dakar",
  );
  const [biographie, setBiographie] = useState(
    initialProfil?.biographie ?? "",
  );
  const [rappelsQuotidiens, setRappelsQuotidiens] = useState(
    initialProfil?.rappelsQuotidiens ?? true,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = updateProfilSchema.safeParse({
      telephone: telephone.trim() ? telephone.trim() : null,
      langue,
      fuseauHoraire: fuseauHoraire.trim() || "UTC",
      biographie: biographie.trim() ? biographie.trim() : null,
      rappelsQuotidiens,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }

    try {
      await updateMutation.mutateAsync(parsed.data);
      setAppLanguage(langue);
      onClose();
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField htmlFor="profil-tel" label="Téléphone">
          <input
            id="profil-tel"
            type="tel"
            placeholder="+221 77 123 45 67"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>

        <FormField htmlFor="profil-langue" label="Langue">
          <select
            id="profil-langue"
            value={langue}
            onChange={(e) => setLangue(e.target.value as LangueProfil)}
            aria-label="Langue du profil"
            className={FORM_SELECT_CLASS}
          >
            {PROFIL_LANGUES.map((code) => (
              <option key={code} value={code}>
                {LANGUE_LABELS[code]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField htmlFor="profil-tz" label="Fuseau horaire (IANA)">
        <input
          id="profil-tz"
          placeholder="Africa/Dakar"
          value={fuseauHoraire}
          onChange={(e) => setFuseauHoraire(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </FormField>

      <FormField htmlFor="profil-bio" label="Biographie" hint="Optionnelle">
        <textarea
          id="profil-bio"
          rows={3}
          maxLength={500}
          placeholder="Quelques mots sur votre activité..."
          value={biographie}
          onChange={(e) => setBiographie(e.target.value)}
          className={cn(FORM_TEXTAREA_CLASS, "resize-none")}
        />
      </FormField>

      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Rappels quotidiens
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Récapitulatif par mail des dettes et créances
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={rappelsQuotidiens}
          aria-label="Activer les rappels quotidiens"
          onClick={() => setRappelsQuotidiens((v) => !v)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150",
            rappelsQuotidiens ? "bg-emerald-500" : "bg-[var(--muted)]",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-150",
              rappelsQuotidiens ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <FormActions
        submitLabel="Enregistrer"
        isPending={updateMutation.isPending}
        accent="primary"
        onCancel={onClose}
      />
    </form>
  );
};

/**
 * Modale mobile-first d'édition du profil et des préférences utilisateur.
 */
export const ProfilEditModal: React.FC<ProfilEditModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: profil, isLoading } = useProfil();

  return (
    <FormSheet
      open={open}
      titleId="profil-modal-title"
      title="Profil & Préférences"
      subtitle="Synchronisé avec votre compte sur tous vos appareils"
      icon={<UserCog className="h-5 w-5" />}
      accent="primary"
      onClose={() => onOpenChange(false)}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        </div>
      ) : (
        <ProfilForm
          key={profil?.updatedAt ?? "empty"}
          initialProfil={profil}
          onClose={() => onOpenChange(false)}
        />
      )}
    </FormSheet>
  );
};
