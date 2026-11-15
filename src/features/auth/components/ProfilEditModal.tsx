import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useProfil,
  useUpdateProfilMutation,
} from "@/features/auth/hooks/useProfil";
import {
  PROFIL_LANGUES,
  updateProfilSchema,
} from "@/features/auth/schemas/profil.schema";
import { extractApiError } from "@/api/api";
import type { LangueProfil, Profil } from "@/types/auth";

interface ProfilEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUE_LABELS: Record<LangueProfil, string> = {
  fr: "Français",
  en: "English",
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
      onClose();
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground block">
            Téléphone
          </label>
          <Input
            type="tel"
            placeholder="+221 77 123 45 67"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="h-10 rounded-xl tabular-nums"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground block">
            Langue
          </label>
          <select
            value={langue}
            onChange={(e) => setLangue(e.target.value as LangueProfil)}
            aria-label="Langue du profil"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {PROFIL_LANGUES.map((code) => (
              <option key={code} value={code}>
                {LANGUE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground block">
          Fuseau horaire (IANA)
        </label>
        <Input
          placeholder="Africa/Dakar"
          value={fuseauHoraire}
          onChange={(e) => setFuseauHoraire(e.target.value)}
          className="h-10 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground block">
          Biographie
        </label>
        <Textarea
          rows={3}
          maxLength={500}
          placeholder="Quelques mots sur votre activité..."
          value={biographie}
          onChange={(e) => setBiographie(e.target.value)}
          className="rounded-xl resize-none text-xs"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5">
        <div>
          <p className="text-xs font-medium text-foreground">
            Rappels quotidiens
          </p>
          <p className="text-[11px] text-muted-foreground">
            Récapitulatif par mail des dettes et créances
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={rappelsQuotidiens}
          aria-label="Activer les rappels quotidiens"
          onClick={() => setRappelsQuotidiens((v) => !v)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ${
            rappelsQuotidiens ? "bg-[var(--finance)]" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-150 ${
              rappelsQuotidiens ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="h-10 rounded-xl text-xs"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="apple-press h-10 rounded-xl px-5 text-xs font-semibold"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  );
};

export const ProfilEditModal: React.FC<ProfilEditModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: profil, isLoading } = useProfil();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Profil &amp; Préférences
          </DialogTitle>
          <DialogDescription className="text-xs">
            Synchronisé avec votre compte sur tous vos appareils.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <ProfilForm
            key={profil?.updatedAt ?? "empty"}
            initialProfil={profil}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
