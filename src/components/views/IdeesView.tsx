import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lightbulb,
  Sparkles,
  Star,
  Plus,
  ArrowUp,
} from "lucide-react";

export interface IdeaItem {
  id: string;
  title: string;
  category: string;
  description: string;
  starred: boolean;
  votes: number;
  date: string;
  status: "En réflexion" | "À tester" | "Validée";
}

interface IdeesViewProps {
  ideas: IdeaItem[];
  onToggleStar: (id: string) => void;
  onUpvote: (id: string) => void;
  onQuickAddIdea: (title: string) => void;
  onOpenQuickAdd: () => void;
}

export const IdeesView: React.FC<IdeesViewProps> = ({
  ideas,
  onToggleStar,
  onUpvote,
  onQuickAddIdea,
  onOpenQuickAdd,
}) => {
  const [quickInput, setQuickInput] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("Toutes");

  const tags = ["Toutes", "💡 Produit", "⚡ Quick Win", "🚀 Growth", "🎯 Stratégie"];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAddIdea(quickInput.trim());
    setQuickInput("");
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (selectedTag === "Toutes") return true;
    return idea.category.toLowerCase().includes(selectedTag.replace(/[^a-zA-Z]/g, "").toLowerCase());
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in-50 duration-300">
      {/* 1. Quick Capture Bar */}
      <form
        onSubmit={handleQuickSubmit}
        className="relative flex items-center gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-sm transition-all focus-within:border-amber-500/60 focus-within:ring-3 focus-within:ring-amber-500/20"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <Lightbulb className="h-5 w-5" />
        </div>
        <Input
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Capturer une idée spontanée en un clic..."
          className="border-0 bg-transparent text-xs placeholder:text-muted-foreground focus-visible:ring-0 shadow-none px-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!quickInput.trim()}
          className="bg-amber-500 text-amber-950 hover:bg-amber-400 font-semibold text-xs gap-1 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </form>

      {/* 2. Category Chips & Advanced Add */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedTag === tag
                  ? "bg-amber-500 text-amber-950 font-bold shadow-xs"
                  : "border border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <Button
          onClick={onOpenQuickAdd}
          variant="outline"
          size="xs"
          className="shrink-0 gap-1 text-xs"
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          Avancé
        </Button>
      </div>

      {/* 3. Ideas Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredIdeas.map((idea) => {
          const statusBadges = {
            "En réflexion": "bg-muted text-muted-foreground",
            "À tester": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
            "Validée": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          };

          return (
            <Card
              key={idea.id}
              className="group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:border-amber-500/40 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {idea.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                        statusBadges[idea.status]
                      }`}
                    >
                      {idea.status}
                    </span>
                    <button
                      onClick={() => onToggleStar(idea.id)}
                      aria-label="Mettre en favori"
                      className="p-1 text-muted-foreground hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          idea.starred
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/60"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <CardTitle className="text-sm font-bold text-foreground mt-1">
                  {idea.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {idea.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">{idea.date}</span>

                <button
                  onClick={() => onUpvote(idea.id)}
                  aria-label="Voter pour cette idée"
                  className="flex items-center gap-1 rounded-md border border-border/70 bg-background/60 px-2 py-0.5 text-xs font-semibold text-foreground transition-all hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-amber-500" />
                  <span>{idea.votes}</span>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
