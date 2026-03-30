"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Play, Pause, Save, X } from "lucide-react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";

export function StudyMode() {
  const isOpen = useStore((state) => state.isStudyModeOpen);
  const closeStudyMode = useStore((state) => state.closeStudyMode);
  const addXp = useStore((state) => state.addXp);
  const profile = useStore((state) => state.profile);

  const [isRunning, setIsRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Study");
  const [isSaving, setIsSaving] = useState(false);

  // Keyboard shortcut to close study mode (might want to prevent accidental closures)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRunning && isOpen) {
        closeStudyMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRunning, closeStudyMode]);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSecondsElapsed(0);
      setNote("");
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = async () => {
    if (secondsElapsed === 0) {
       closeStudyMode();
       return;
    }

    setIsSaving(true);
    setIsRunning(false);

    const supabase = createClient();

    if (profile?.id) {
      await supabase.from("study_sessions").insert([
        {
          user_id: profile.id,
          category,
          duration: secondsElapsed,
          note: note.trim()
        }
      ]);
      // Update XP
      await supabase.from("profiles").update({ xp: profile.xp + 25 }).eq("id", profile.id);
    }

    addXp(25);
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#00ff88', '#00eeff', '#ff9900']
    });

    setIsSaving(false);
    closeStudyMode();
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard this session? Time tracked will be lost.")) {
      setIsRunning(false);
      closeStudyMode();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex w-full max-w-lg flex-col items-center justify-center p-6 text-center">
        
        <div className="mb-2 text-4xl font-bold font-syne text-white drop-shadow-md">
           📚 Study Mode
        </div>
        <p className="mb-10 text-muted-foreground font-mono">
           Stay focused. Every second counts.
        </p>

        <div className="mb-6 font-mono text-[5rem] md:text-[7rem] font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none">
          {formatTime(secondsElapsed)}
        </div>

        <div className="mb-10 flex items-center justify-center gap-2 text-sm font-bold tracking-widest uppercase">
          {isRunning ? (
            <span className="text-themeGreen animate-pulse">▶ Active</span>
          ) : (
            <span className="text-themeOrange">⏸ Paused</span>
          )}
        </div>

        <div className="w-full space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
               <select
                 value={category}
                 title="Study Category"
                 aria-label="Study Category"
                 onChange={(e) => setCategory(e.target.value)}
                 className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
               >
                 <option value="Study">Study</option>
                 <option value="Reading">Reading</option>
                 <option value="Coding">Coding</option>
                 <option value="Writing">Writing</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Session Note</label>
               <input
                 type="text"
                 value={note}
                 placeholder="e.g. Chapter 3..."
                 title="Session Note"
                 aria-label="Session Note"
                 onChange={(e) => setNote(e.target.value)}
                 className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
               />
            </div>
          </div>
        </div>

        <div className="mt-12 flex w-full flex-col gap-3 sm:flex-row justify-center">
          <button
            onClick={toggleTimer}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold shadow-lg transition-transform active:scale-95",
              isRunning 
                ? "bg-themeOrange/20 text-themeOrange border border-themeOrange/50 hover:bg-themeOrange/30"
                : "bg-themeGreen text-background hover:bg-themeGreen/90 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
            )}
          >
            {isRunning ? (
              <><Pause className="h-5 w-5" /> Pause</>
            ) : (
              <><Play className="h-5 w-5" /> Start</>
            )}
          </button>
          
          <button
            onClick={handleSaveSession}
            disabled={isSaving || secondsElapsed === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-themeCyan text-background px-6 py-3 font-bold shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-transform hover:bg-themeCyan/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : "Save Session"}
          </button>
        </div>

        <button
           onClick={handleDiscard}
           className="mt-6 flex items-center justify-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors"
        >
           <X className="h-4 w-4" /> Discard & Close
        </button>
      </div>
    </div>
  );
}
