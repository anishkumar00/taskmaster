"use client";

import { useStore, type Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { CalendarIcon, TagIcon } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useStore((state) => state.updateTask);
  const openTaskModal = useStore((state) => state.openTaskModal);
  const addXp = useStore((state) => state.addXp);

  const priorityColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-green-500/10 text-green-500 border-green-500/30",
  };

  const priorityLabels = {
    high: "🔴 High",
    medium: "🟡 Medium",
    low: "🟢 Low",
  };

  const handleToggleComplete = () => {
    const isNowCompleted = !task.completed;
    updateTask(task.id, { completed: isNowCompleted });

    if (isNowCompleted) {
      addXp(10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff88', '#00eeff', '#ff9900']
      });
      // TODO: Sink to Supabase
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-border/80 hover:shadow-md",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={handleToggleComplete}
            aria-label="Toggle task completion"
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
              task.completed
                ? "border-themeGreen bg-themeGreen text-background"
                : "border-muted-foreground hover:border-themeGreen"
            )}
          >
            {task.completed && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div 
            className="flex-1 cursor-pointer"
            onClick={() => openTaskModal(task)}
          >
            <h3
              className={cn(
                "font-semibold text-foreground transition-all font-syne",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            {task.notes && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground font-mono">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <div
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            priorityColors[task.priority]
          )}
        >
          {priorityLabels[task.priority]}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-8 text-xs text-muted-foreground font-mono">
        {task.category && (
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
            <TagIcon className="h-3 w-3" />
            <span>{task.category}</span>
          </div>
        )}
        
        {task.due_date && (
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}

        {task.subtasks?.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
            <div className="flex gap-0.5">
              {task.subtasks.map((st, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-3 rounded-full",
                    st.completed ? "bg-themeGreen" : "bg-border"
                  )}
                />
              ))}
            </div>
            <span>
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
