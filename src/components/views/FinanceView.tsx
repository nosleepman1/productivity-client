import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Plus,
} from "lucide-react";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface FinanceViewProps {
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  onOpenQuickAdd,
}) => {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "income") return t.type === "income";
    if (filter === "expense") return t.type === "expense";
    return true;
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in-50 duration-300">
      {/* 1. Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 shadow-sm">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trésorerie Globale
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> +14.8%
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {balance.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </h2>
              <span className="text-xs text-muted-foreground">disponible</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onOpenQuickAdd}
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nouvelle opération
            </Button>
          </div>
        </div>

        {/* 2. Sub Metric Tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Revenus</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              +{totalIncome.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Dépenses</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-destructive">
              -{totalExpense.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-border/60 bg-background/60 p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Taux d&apos;épargne</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PieChart className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">
              {totalIncome > 0
                ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Budget Allocations */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Budgets & Répartition SaaS / Ops</span>
            <span className="text-xs text-muted-foreground font-normal">Novembre 2026</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">Infrastructure & Cloud (AWS, Vercel)</span>
              <span className="text-muted-foreground">€420 / €600 (70%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: "70%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">Outils Dev & Licences (GitHub, JetBrains)</span>
              <span className="text-muted-foreground">€180 / €300 (60%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "60%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">Marketing & Acquisition</span>
              <span className="text-muted-foreground">€850 / €1 000 (85%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-amber-500" style={{ width: "85%" }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Activités récentes</h3>

          {/* Filter Pills */}
          <div className="flex rounded-lg bg-muted/60 p-0.5 text-xs border border-border/50">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "all"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "income"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Revenus
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "expense"
                  ? "bg-card text-destructive shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dépenses
            </button>
          </div>
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Aucune transaction trouvée dans ce filtre.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      tx.type === "income"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold ${
                    tx.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.amount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
