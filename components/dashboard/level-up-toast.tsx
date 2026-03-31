"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Trophy, X } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export function LevelUpToast() {
  const levelUpDetails = useStore((state) => state.levelUpDetails);
  const clearToast = useStore((state) => state.clearLevelUpToast);

  useEffect(() => {
    if (levelUpDetails) {
      // Fire a grand celebratory confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#00eeff', '#00ff88', '#ff9900', '#ffffff']
        });
      }, 250);

      // Auto clear after 8 seconds
      const timeout = setTimeout(() => {
        clearToast();
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [levelUpDetails, clearToast]);

  if (!levelUpDetails) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="relative overflow-hidden rounded-xl bg-surface border-2 border-themeCyan p-6 shadow-[0_0_30px_rgba(0,238,255,0.3)] max-w-sm">
        
        {/* Glow background */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-themeCyan/20 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-themeGreen/20 blur-2xl"></div>

        <button 
          onClick={clearToast}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-themeCyan/20 text-themeCyan">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-syne text-white tracking-wide">
              Level Up!
            </h3>
            <p className="mt-1 text-sm text-foreground/80 font-mono">
              You reached <span className="font-bold text-themeCyan">Level {levelUpDetails.newLevel}</span>!
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-themeGreen">
              Rank: {levelUpDetails.newTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
