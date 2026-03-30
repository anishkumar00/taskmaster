"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MobileOverlay() {
  const isOpen = useStore((state) => state.isSidebarOpen);
  const setIsOpen = useStore((state) => state.setIsOpen);

  return (
    <div
      onClick={() => setIsOpen(false)}
      className={cn(
        "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    />
  );
}
