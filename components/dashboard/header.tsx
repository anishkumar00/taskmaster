"use client";

import { useStore } from "@/lib/store";
import { Menu, Plus, BookOpen, Settings, User } from "lucide-react";

export function DashboardHeader() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold font-syne tracking-tight text-white drop-shadow-md">
            <span className="text-themeOrange">⚡</span> TaskMaster
          </span>
        </div>
      </div>

      <div className="hidden sm:flex flex-1 max-w-sm mx-4 items-center">
        <div className="flex w-full flex-col gap-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-themeCyan font-bold">Lv.1 Newbie</span>
            <span className="text-muted-foreground">0 XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-themeCyan w-0 transition-all duration-500 ease-in-out"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center px-3 py-1 bg-surface border border-themeOrange/20 rounded-full">
          <span className="text-sm font-bold text-themeOrange font-mono drop-shadow-[0_0_5px_rgba(255,153,0,0.5)]">🔥0d</span>
        </div>
        
        <button onClick={() => useStore.getState().openStudyMode()} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-themeCyan/10 text-themeCyan hover:bg-themeCyan/20 border border-themeCyan/50 rounded-md transition-colors">
          <BookOpen className="h-4 w-4" />
          Study
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-themeGreen text-background hover:bg-themeGreen/90 shadow-[0_0_10px_rgba(0,255,136,0.3)] rounded-md transition-all">
          <Plus className="h-4 w-4" />
          Task
        </button>

        <button aria-label="Settings" title="Settings" className="hidden sm:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
          <Settings className="h-5 w-5" />
        </button>

        <button aria-label="User Profile" title="User Profile" className="flex items-center justify-center p-1 rounded-full border border-border bg-surface hover:bg-muted transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-themeCyan/20 text-themeCyan text-xs">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
