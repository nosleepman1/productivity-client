import React, { useState } from "react";
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
  Wallet,
  FolderKanban,
  Lightbulb,
  Plus,
  Check,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import { useCreateDepenseMutation } from "@/features/finances/hooks/useDepenses";
import { useCreateRevenuMutation } from "@/features/finances/hooks/useRevenus";
import {
  toTransactionDto,
  transactionFormSchema,
} from "@/features/finances/schemas/transaction.schema";
import { toDateInputValue } from "@/features/finances/utils/format";
import { useCreateNoteMutation } from "@/features/productivity/hooks/useNotes";
import { useCreateProjetMutation } from "@/features/productivity/hooks/useProjets";
import {
  noteFormSchema,
  toCreateNoteDto,
} from "@/features/productivity/schemas/note.schema";
import {
  projetFormSchema,
  toCreateProjetDto,
} from "@/features/productivity/schemas/projet.schema";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { activeEspaceId } = useActiveEspace();
  const createRevenu = useCreateRevenuMutation(activeEspaceId);
  const createDepense = useCreateDepenseMutation(activeEspaceId);
  const createProjet = useCreateProjetMutation(activeEspaceId);
  const createNote = useCreateNoteMutation(activeEspaceId);

  const [activeType, setActiveType] = useState<"finance" | "projet" | "idee">("finance");

  // Finance form
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txError, setTxError] = useState<string | null>(null);

  // Project form
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDebut, setProjDebut] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [projError, setProjError] = useState<string | null>(null);

  // Note / Idea form
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [ideaError, setIdeaError] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === "finance") {
      const parsed = transactionFormSchema.safeParse({
        montant: txAmount.trim() === "" ? NaN : Number(txAmount),
        description: txTitle,
      });

      if (!parsed.success) {
        setTxError(parsed.error.issues[0]?.message ?? "Données invalides");
        return;
      }

      setTxError(null);
      const dto = toTransactionDto(parsed.data);
      if (txType === "income") {
        await createRevenu.mutateAsync(dto);
      } else {
        await createDepense.mutateAsync(dto);
      }
      setTxTitle("");
      setTxAmount("");
    } else if (activeType === "projet") {
      const parsed = projetFormSchema.safeParse({
        titre: projTitle,
        description: projDesc,
        dateDebut: projDebut,
        estTermine: false,
      });

      if (!parsed.success) {
        setProjError(parsed.error.issues[0]?.message ?? "Données invalides");
        return;
      }

      setProjError(null);
      await createProjet.mutateAsync(toCreateProjetDto(parsed.data));
      setProjTitle("");
      setProjDesc("");
    } else if (activeType === "idee") {
      const parsed = noteFormSchema.safeParse({
        titre: ideaTitle,
        contenu: ideaDesc,
      });

      if (!parsed.success) {
        setIdeaError(parsed.error.issues[0]?.message ?? "Données invalides");
        return;
      }

      setIdeaError(null);
      await createNote.mutateAsync(toCreateNoteDto(parsed.data));
      setIdeaTitle("");
      setIdeaDesc("");
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card shadow-2xl p-6">
        <DialogHeader className="gap-1 pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Plus className="h-4 w-4" />
            </span>
            Ajout Rapide
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sélectionnez le type d&apos;élément à créer dans votre espace.
          </DialogDescription>
        </DialogHeader>

        {/* 3 Action Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
          <button
            type="button"
            onClick={() => setActiveType("finance")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
              activeType === "finance"
                ? "bg-card text-foreground shadow-xs font-semibold ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-500" />
            Finance
          </button>

          <button
            type="button"
            onClick={() => setActiveType("projet")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
              activeType === "projet"
                ? "bg-card text-foreground shadow-xs font-semibold ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
            Projet
          </button>

          <button
            type="button"
            onClick={() => setActiveType("idee")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
              activeType === "idee"
                ? "bg-card text-foreground shadow-xs font-semibold ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            Idée
          </button>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3.5">
          {activeType === "finance" && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType("expense")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium border transition-all ${
                    txType === "expense"
                      ? "border-destructive/40 bg-destructive/10 text-destructive font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Dépense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("income")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium border transition-all ${
                    txType === "income"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Revenu (+)
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Description / Libellé
                </label>
                <Input
                  required
                  placeholder="ex: Abonnement Vercel, Facture client..."
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Montant (FCFA)
                </label>
                <Input
                  required
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="ex: 25000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="bg-background text-sm tabular-nums"
                />
              </div>
              {txError && (
                <p className="text-xs text-rose-500">{txError}</p>
              )}
            </>
          )}

          {activeType === "projet" && (
            <>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Titre du projet
                </label>
                <Input
                  required
                  placeholder="ex: Refonte landing page & SEO"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Description
                </label>
                <Textarea
                  required
                  placeholder="Objectif et livrables clés..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Date de début
                </label>
                <Input
                  required
                  type="date"
                  value={projDebut}
                  onChange={(e) => setProjDebut(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
              {projError && (
                <p className="text-xs text-rose-500">{projError}</p>
              )}
            </>
          )}

          {activeType === "idee" && (
            <>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Titre de la note / idée
                </label>
                <Input
                  required
                  placeholder="ex: Automatiser les relances"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Contenu
                </label>
                <Textarea
                  required
                  placeholder="Détails, liens ou pensées clés..."
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                />
              </div>
              {ideaError && (
                <p className="text-xs text-rose-500">{ideaError}</p>
              )}
            </>
          )}

          <div className="mt-2 flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-md shadow-primary/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Enregistré !
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

