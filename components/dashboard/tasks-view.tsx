"use client";

import { useEffect, useState } from "react";
import { useStore, type Task, type Profile } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "./task-card";
import { TaskModal } from "./task-modal";
import { Plus } from "lucide-react";

export function TasksView() {
  const tasks = useStore((state) => state.tasks);
  const setTasks = useStore((state) => state.setTasks);
  const setProfile = useStore((state) => state.setProfile);
  const profile = useStore((state) => state.profile);
  const openTaskModal = useStore((state) => state.openTaskModal);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        } else {
          // Attempt to create a profile if it doesn't exist
          const newProfile = {
            id: user.id,
            name: user.email?.split("@")[0] || "User",
            avatar: "🧑‍💻",
            xp: 0,
            streak: 0,
          };
          const { data: insertedProfile } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();
            
          if (insertedProfile) setProfile(insertedProfile as Profile);
        }

        // Fetch Tasks
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksData) {
          setTasks(tasksData as Task[]);
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [setTasks, setProfile]);

  // Sync profile XP to Supabase when it changes (debounce or send on change)
  // Simplified for this implementation: assuming profile updates only happen with tasks for now
  useEffect(() => {
    if (profile) {
      const syncProfile = async () => {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ xp: profile.xp })
          .eq("id", profile.id);
      };
      
      const timeout = setTimeout(syncProfile, 2000);
      return () => clearTimeout(timeout); // Debounce profile sync to DB
    }
  }, [profile, profile?.xp]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-themeCyan"></div>
      </div>
    );
  }

  return (
    <div className="relative p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-full pb-24">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-syne">Good morning, {profile?.name || "Ready to get things done?"}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">You have {tasks.filter(t => !t.completed).length} incomplete tasks today.</p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 rounded-md bg-themeGreen px-4 py-2 font-bold text-background shadow-md hover:bg-themeGreen/90 transition-all font-mono"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </button>
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
            <span className="text-4xl mb-3 opacity-50">🌱</span>
            <p className="text-muted-foreground font-mono">No tasks yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click Add Task to start your journey.</p>
          </div>
        )}
      </div>

      <TaskModal />
    </div>
  );
}
