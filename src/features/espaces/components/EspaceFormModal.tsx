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
import { useCreateEspaceMutation } from "@/features/espaces/hooks/useEspaces";
import { createEspaceSchema } from "@/features/espaces/schemas/espace.schema";
import { extractApiError } from "@/api/api";
import type { EspaceType } from "@/types/espaces";

interface EspaceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCENT_COLORS = [
  "#007AFF",
  "#34C759",
  "#5856D6",
  "#FF9500",
  "#0D9488",
  "#FF3B30",
];

const TYPE_OPTIONS: Array<{ value: EspaceType; label: string }> = [
  { value: "PERSONAL", label: "Personnel" },
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "OTHER", label: "Autre" },
];

export const EspaceFormModal: React.FC<EspaceFormModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreateEspaceMutation();
  const [nom, setNom] = useState("");
  const [type, setType] = useState<EspaceType>("ENTREPRISE");
  const [couleur, setCouleur] = useState(ACCENT_COLORS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setNom("");
    setType("ENTREPRISE");
    setCouleur(ACCENT_COLORS[0]);
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = createEspaceSchema.safeParse({
      nom,
      type,
      couleur,
      description: description.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      const apiErr = extractApiError(err);
      setError(
        Array.isArray(apiErr.message) ? apiErr.message[0] : apiErr.message,
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[420px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Nouvel espace de travail
          </DialogTitle>
          <DialogDescription className="text-xs">
            Chaque espace isole strictement ses projets, tâches, notes et finances.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Nom de l&apos;espace
            </label>
            <Input
              required
              placeholder="ex: Studio Design, Freelance..."
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Type
            </label>
            <div className="grid grid-cols-3 rounded-xl bg-muted p-1">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`apple-press h-8 rounded-lg text-xs font-medium ${
                    type === opt.value
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Couleur repère
            </label>
            <div className="flex items-center gap-2.5">
              {ACCENT_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCouleur(hex)}
                  aria-label={`Couleur ${hex}`}
                  className={`apple-press h-8 w-8 rounded-full transition-transform ${
                    couleur === hex
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-105"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Description (optionnel)
            </label>
            <Textarea
              rows={2}
              placeholder="Contexte ou objectif de cet espace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none text-xs"
            />
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
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="apple-press h-10 rounded-xl px-5 text-xs font-semibold"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Créer l'espace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
