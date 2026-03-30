"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sun, ClipboardList, CheckCircle2, RotateCcw, BarChart3, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { PomodoroWidget } from "./pomodoro-widget";

export function DashboardSidebar() {
  const isOpen = useStore((state) => state.isSidebarOpen);
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/dashboard", icon: Sun },
    { name: "All Tasks", href: "/dashboard/tasks", icon: ClipboardList },
    { name: "Completed", href: "/dashboard/completed", icon: CheckCircle2 },
    { name: "Habit Tracker", href: "/dashboard/habits", icon: RotateCcw },
    { name: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 md:hidden">
        <span className="text-lg font-bold font-syne text-white">
          <span className="text-themeOrange">⚡</span> TaskMaster
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <nav className="space-y-1 block">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors font-mono",
                  isActive
                    ? "bg-themeGreen/10 text-themeGreen shadow-[0_0_8px_rgba(0,255,136,0.1)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-themeGreen" : "")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <h4 className="text-xs font-bold text-muted-foreground tracking-wider">CATEGORIES</h4>
            <button aria-label="Category Settings" title="Category Settings" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-md transition-colors group">
              <span className="h-2.5 w-2.5 rounded-full bg-themeCyberBlue shadow-[0_0_5px_rgba(0,238,255,0.5)]"></span>
              <span className="text-muted-foreground group-hover:text-foreground">Personal</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-md transition-colors group">
              <span className="h-2.5 w-2.5 rounded-full bg-themePink shadow-[0_0_5px_rgba(255,0,128,0.5)]"></span>
              <span className="text-muted-foreground group-hover:text-foreground">Work</span>
            </div>
          </div>
        </div>

        {/* Pomodoro Widget */}
        <PomodoroWidget />

        {/* Motivation Widget */}
        <div className="rounded-lg border border-border bg-surface/50 p-3 mt-4 cursor-pointer hover:bg-surface transition-colors cursor-pointer text-center group">
          <div className="text-xs text-muted-foreground mb-1 group-hover:text-foreground transition-colors">💬 tap for motivation</div>
          <div className="text-sm italic font-syne text-foreground">
            &quot;Every second counts.&quot;
          </div>
        </div>
      </div>
    </aside>
  );
}
