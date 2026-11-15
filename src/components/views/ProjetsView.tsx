import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Flame,
  Layers,
} from "lucide-react";

export interface Project {
  id: string;
  title: string;
  tag: string;
  priority: "Urgente" | "Prioritaire" | "Normale";
  progress: number;
  deadline: string;
  completedTasks: number;
  totalTasks: number;
}

export interface TaskItem {
  id: string;
  title: string;
  project: string;
  completed: boolean;
  dueDate: string;
}

interface ProjetsViewProps {
  projects: Project[];
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onOpenQuickAdd: () => void;
}

export const ProjetsView: React.FC<ProjetsViewProps> = ({
  projects,
  tasks,
  onToggleTask,
  onOpenQuickAdd,
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in-50 duration-300">
      {/* 1. Header Overview & Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Projets en cours</span>
          <p className="mt-1 text-2xl font-black text-primary">{projects.length}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">À faire</span>
          <p className="mt-1 text-2xl font-black text-amber-500">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Terminées</span>
          <p className="mt-1 text-2xl font-black text-emerald-500">{completedCount}</p>
        </div>
      </div>

      {/* 2. Active Projects Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Projets Majeurs
          </h3>
          <Button
            onClick={onOpenQuickAdd}
            size="xs"
            variant="outline"
            className="gap-1 text-xs"
          >
            <Plus className="h-3 w-3" /> Nouveau projet
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((proj) => {
            const priorityColors = {
              Urgente: "bg-destructive/10 text-destructive border-destructive/20",
              Prioritaire: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              Normale: "bg-primary/10 text-primary border-primary/20",
            };

            return (
              <Card
                key={proj.id}
                className="overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                        priorityColors[proj.priority]
                      }`}
                    >
                      {proj.priority === "Urgente" && <Flame className="h-3 w-3" />}
                      {proj.priority}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {proj.deadline}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold mt-1 text-foreground">
                    {proj.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Catégorie: {proj.tag}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progression</span>
                    <span className="font-semibold text-foreground">{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                    <span>
                      {proj.completedTasks}/{proj.totalTasks} tâches
                    </span>
                    <span className="text-primary font-medium text-[11px]">En cours</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Action Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Tâches & Jalons à cocher</h3>
          <div className="flex rounded-lg bg-muted/60 p-0.5 text-xs border border-border/50">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "all" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "active" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
              }`}
            >
              À faire
            </button>
            <button
              onClick={() => setFilter("done")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "done" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground"
              }`}
            >
              Faites
            </button>
          </div>
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {tasks
            .filter((t) => {
              if (filter === "active") return !t.completed;
              if (filter === "done") return t.completed;
              return true;
            })
            .map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className="group flex cursor-pointer items-center justify-between p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Cocher tâche"
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground transition-transform group-hover:scale-110"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in-75 duration-200" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/60 hover:text-primary" />
                    )}
                  </button>

                  <div>
                    <p
                      className={`text-xs font-medium transition-all ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {task.project} • {task.dueDate}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${
                    task.completed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {task.completed ? "Terminé" : "En attente"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
