"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";

export function PomodoroWidget() {
  const status = useStore((state) => state.pomodoroStatus);
  const timeLeft = useStore((state) => state.pomodoroTimeLeft);
  const focusDur = useStore((state) => state.focusDuration);
  const breakDur = useStore((state) => state.breakDuration);
  const setStatus = useStore((state) => state.setPomodoroStatus);
  const setTimeLeft = useStore((state) => state.setPomodoroTimeLeft);
  const setDurations = useStore((state) => state.setPomodoroDurations);
  const addXp = useStore((state) => state.addXp);

  const [isEditing, setIsEditing] = useState(false);
  const [editFocus, setEditFocus] = useState(focusDur.toString());
  const [editBreak, setEditBreak] = useState(breakDur.toString());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status !== 'idle') {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    
    if (timeLeft <= 0 && status !== 'idle') {
      if (status === 'focus') {
        const supabase = createClient();
        const profile = useStore.getState().profile;
        if (profile) {
          // Log session and award XP
          supabase.from("pomodoro_sessions").insert([{
            user_id: profile.id,
            duration: focusDur,
          }]).then();
          supabase.from("profiles").update({ xp: profile.xp + 50 }).eq("id", profile.id).then();
        }

        // Finished focus -> get 50 XP, switch to break
        addXp(50);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        colors: ['#00ff88', '#00eeff']
        });
        setStatus('break');
        setTimeLeft(breakDur * 60);
      } else if (status === 'break') {
        // Finished break -> back to idle
        setStatus('idle');
        setTimeLeft(focusDur * 60);
      }
    }
    
    return () => clearInterval(interval);
  }, [status, timeLeft, focusDur, breakDur, setTimeLeft, setStatus, addXp]);

  const toggleTimer = () => {
    if (status === 'idle') setStatus('focus');
    else setStatus('idle'); // acts as pause/stop for simplicity or we can add precise "paused" state
  };

  const resetTimer = () => {
    setStatus('idle');
    setTimeLeft(focusDur * 60);
  };

  const handleSaveEdit = () => {
    const f = parseInt(editFocus) || 25;
    const b = parseInt(editBreak) || 5;
    setDurations(f, b);
    if (status === 'idle') {
      setTimeLeft(f * 60);
    }
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentMax = status === 'focus' || status === 'idle' ? focusDur * 60 : breakDur * 60;
  const progressPercent = 100 - (timeLeft / currentMax) * 100;

  return (
    <div className="rounded-lg border border-border bg-surface p-3 mt-4">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-bold tracking-wider text-muted-foreground">⏱ POMODORO</span>
        <button 
          onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} 
          className="text-themeCyan hover:underline hover:text-themeCyan/80 font-mono"
        >
          {isEditing ? "save" : "edit"}
        </button>
      </div>

      {isEditing ? (
        <div className="mb-4 space-y-2 text-sm text-muted-foreground font-mono">
          <div className="flex items-center justify-between">
            <label>Focus (min)</label>
            <input 
              type="number" 
              value={editFocus} 
              aria-label="Focus time in minutes"
              title="Focus time in minutes"
              onChange={(e) => setEditFocus(e.target.value)} 
              className="w-16 rounded border border-border bg-background px-2 py-1 text-foreground" 
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Break (min)</label>
            <input 
              type="number" 
              value={editBreak} 
              aria-label="Break time in minutes"
              title="Break time in minutes"
              onChange={(e) => setEditBreak(e.target.value)} 
              className="w-16 rounded border border-border bg-background px-2 py-1 text-foreground" 
            />
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <div className={`text-3xl font-mono font-bold font-jetbrains tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] ${status === 'break' ? 'text-themeOrange' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className={`text-[10px] font-bold tracking-widest mt-1 uppercase ${status === 'break' ? 'text-themeOrange' : 'text-themeCyan'}`}>
              {status === 'break' ? `BREAK ${breakDur}min` : `FOCUS ${focusDur}min (+50 XP)`}
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${status === 'break' ? 'bg-themeOrange' : 'bg-themeCyan'}`} 
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button 
          onClick={toggleTimer} 
          disabled={isEditing}
          className="flex-1 flex items-center justify-center gap-1 bg-themeCyan/10 hover:bg-themeCyan/20 text-themeCyan border border-themeCyan/50 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
        >
          {status !== 'idle' ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
        </button>
        <button 
          onClick={resetTimer}
          aria-label="Reset Pomodoro" 
          title="Reset Pomodoro" 
          className="flex items-center justify-center p-1.5 bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
