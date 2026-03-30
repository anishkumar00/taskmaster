"use client";

import { useEffect, useState } from "react";
import { useStore, type Habit, type HabitLog } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Plus, Check, Flame, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export function HabitsView() {
  const habits = useStore((state) => state.habits);
  const habitLogs = useStore((state) => state.habitLogs);
  const setHabits = useStore((state) => state.setHabits);
  const setHabitLogs = useStore((state) => state.setHabitLogs);
  const addHabit = useStore((state) => state.addHabit);
  const updateHabitLog = useStore((state) => state.updateHabitLog);
  const addXp = useStore((state) => state.addXp);
  const profile = useStore((state) => state.profile);

  const [isLoading, setIsLoading] = useState(true);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Generate last 7 days starting from today (index 6 is today, 0 is 6 days ago)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    async function fetchHabits() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const { data: logsData } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id);

      if (habitsData) setHabits(habitsData as Habit[]);
      if (logsData) setHabitLogs(logsData as HabitLog[]);

      setIsLoading(false);
    }
    fetchHabits();
  }, [setHabits, setHabitLogs]);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim() || !profile) return;

    setIsAdding(true);
    const tempId = crypto.randomUUID();
    const newHabit: Habit = {
      id: tempId,
      user_id: profile.id,
      title: newHabitTitle.trim(),
      goal_days: 30,
      created_at: new Date().toISOString()
    };
    
    addHabit(newHabit);
    setNewHabitTitle("");

    const supabase = createClient();
    const { data } = await supabase.from("habits").insert([newHabit]).select().single();
    
    // We ideally replace the tempId with data.id in Zustand, 
    // but a full refetch or state map is robust enough for this prototype.
    if (data) {
      setHabits(useStore.getState().habits.map(h => h.id === tempId ? data : h));
    }
    setIsAdding(false);
  };

  const handleToggleLog = async (habitId: string, date: string, currentStatus: boolean) => {
    if (!profile) return;
    const newStatus = !currentStatus;
    
    // Optimistic Update
    updateHabitLog(habitId, date, newStatus);
    
    if (newStatus) {
      addXp(5);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff9900', '#00ff88']
      });
    }

    const supabase = createClient();
    
    // Upsert logic for habit logs
    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habitId)
      .eq("log_date", date)
      .single();

    if (existingLog) {
      await supabase
        .from("habit_logs")
        .update({ status: newStatus })
        .eq("id", existingLog.id);
    } else {
      await supabase
        .from("habit_logs")
        .insert([{
          habit_id: habitId,
          user_id: profile.id,
          log_date: date,
          status: newStatus
        }]);
    }
    
    // Sync XP
    if (newStatus) {
      await supabase.from("profiles").update({ xp: profile.xp + 5 }).eq("id", profile.id);
    }
  };

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    // Count backwards from today
    for (let i = 6; i >= 0; i--) {
      const date = last7Days[i];
      const log = habitLogs.find(l => l.habit_id === habitId && l.log_date === date);
      if (log?.status) {
        streak++;
      } else if (i !== 6) { 
        // If it's not today and it's missed, streak breaks. 
        // We give leeway if today isn't checked yet.
        break;
      }
    }
    return streak;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-themeOrange"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-full pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-syne mb-2">Habit Tracker 🔄</h1>
        <p className="text-muted-foreground font-mono">Build consistency. Every checkmark earns you +5 XP.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          
          <div className="flex items-end justify-between mb-4 border-b border-border pb-4 hidden sm:flex">
            <div className="w-1/3 text-sm font-bold text-muted-foreground uppercase tracking-wider">Habit</div>
            <div className="flex w-1/2 justify-between px-4">
              {last7Days.map((date, i) => {
                const d = new Date(date);
                const dayName = d.toLocaleDateString("en-US", { weekday: 'short' });
                return (
                  <div key={date} className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">{dayName}</span>
                    <span className={cn("text-xs font-bold mt-1", i === 6 ? "text-themeOrange" : "text-foreground")}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-24 text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">Streak</div>
          </div>

          <div className="space-y-4">
            {habits.map(habit => {
              const streak = calculateStreak(habit.id);
              return (
                <div key={habit.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-background border border-border hover:border-border/80 transition-colors">
                  <div className="sm:w-1/3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-themeOrange/10 flex items-center justify-center text-themeOrange shrink-0">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <span className="font-bold font-syne truncate">{habit.title}</span>
                  </div>

                  <div className="flex sm:w-1/2 justify-between px-4 gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {last7Days.map((date, i) => {
                      const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === date);
                      const isCompleted = log?.status || false;
                      const isToday = i === 6;
                      
                      return (
                        <button
                          key={date}
                          onClick={() => handleToggleLog(habit.id, date, isCompleted)}
                          className={cn(
                            "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md border-2 transition-all hover:scale-105",
                            isCompleted 
                              ? "border-themeOrange bg-themeOrange text-background shadow-[0_0_10px_rgba(255,153,0,0.3)]" 
                              : isToday
                                ? "border-muted-foreground border-dashed hover:border-themeOrange"
                                : "border-border bg-surface hover:border-muted-foreground"
                          )}
                        >
                          {isCompleted && <Check className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="sm:w-24 flex items-center justify-between sm:justify-center gap-2 px-4 sm:px-0">
                    <span className="text-xs text-muted-foreground sm:hidden tracking-wider uppercase">Streak</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Flame className={cn("h-4 w-4", streak > 0 ? "text-themeOrange" : "text-muted-foreground opacity-50")} />
                      <span className={cn("font-bold text-lg", streak > 0 ? "text-themeOrange" : "text-muted-foreground opacity-50")}>
                        {streak}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {habits.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground font-mono">No habits tracked yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Add New Habit</h3>
          <form onSubmit={handleAddHabit} className="flex gap-3">
            <input
              type="text"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="e.g. Read 10 pages, Meditate, Workout..."
              className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeOrange"
            />
            <button
              type="submit"
              disabled={isAdding || !newHabitTitle.trim()}
              className="flex items-center gap-2 rounded-md bg-themeOrange px-6 py-2.5 font-bold text-background shadow-[0_0_10px_rgba(255,153,0,0.2)] hover:bg-themeOrange/90 transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
