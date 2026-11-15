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

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction?: (tx: { title: string; amount: number; type: "income" | "expense"; category: string }) => void;
  onAddProject?: (proj: { title: string; tag: string; deadline: string }) => void;
  onAddIdea?: (idea: { title: string; category: string; description: string }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  open,
  onOpenChange,
  onAddTransaction,
  onAddProject,
  onAddIdea,
}) => {
  const [activeType, setActiveType] = useState<"finance" | "projet" | "idee">("finance");

  // Finance form
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txCategory, setTxCategory] = useState("Outils & SaaS");

  // Project form
  const [projTitle, setProjTitle] = useState("");
  const [projTag, setProjTag] = useState("Prioritaire");
  const [projDeadline, setProjDeadline] = useState("Dans 2 semaines");

  // Idea form
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCat, setIdeaCat] = useState("💡 Produit");
  const [ideaDesc, setIdeaDesc] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === "finance" && txTitle && txAmount) {
      onAddTransaction?.({
        title: txTitle,
        amount: parseFloat(txAmount) || 0,
        type: txType,
        category: txCategory,
      });
      setTxTitle("");
      setTxAmount("");
    } else if (activeType === "projet" && projTitle) {
      onAddProject?.({
        title: projTitle,
        tag: projTag,
        deadline: projDeadline,
      });
      setProjTitle("");
    } else if (activeType === "idee" && ideaTitle) {
      onAddIdea?.({
        title: ideaTitle,
        category: ideaCat,
        description: ideaDesc,
      });
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
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Montant (€)
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="ex: 49.99"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Catégorie
                  </label>
                  <Input
                    placeholder="Outils, Salaires..."
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {activeType === "projet" && (
            <>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Titre du projet / jalon
                </label>
                <Input
                  required
                  placeholder="ex: Refonte landing page & SEO"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Priorité
                  </label>
                  <select
                    value={projTag}
                    onChange={(e) => setProjTag(e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                  >
                    <option value="Urgente">🔥 Urgente</option>
                    <option value="Prioritaire">⚡ Prioritaire</option>
                    <option value="Normale">🌱 Normale</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Échéance
                  </label>
                  <Input
                    placeholder="ex: Vendredi prochain"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {activeType === "idee" && (
            <>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Titre de l&apos;idée
                </label>
                <Input
                  required
                  placeholder="ex: Automatiser les relances avec l'IA"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Catégorie
                </label>
                <select
                  value={ideaCat}
                  onChange={(e) => setIdeaCat(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                >
                  <option value="💡 Produit">💡 Produit</option>
                  <option value="🚀 Growth & Marketing">🚀 Growth & Marketing</option>
                  <option value="⚡ Quick Win">⚡ Quick Win</option>
                  <option value="🎯 Stratégie">🎯 Stratégie</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Notes / Contexte (optionnel)
                </label>
                <Textarea
                  placeholder="Détails, liens ou pensées clés..."
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>
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

