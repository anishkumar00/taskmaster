"use client";

import { motion } from "framer-motion";
import { useTaskStore } from "@/lib/store";

export default function Home() {
  const { title } = useTaskStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="text-6xl font-syne font-bold text-themeGreen drop-shadow-md">
          {title}
        </h1>
        
        <p className="text-xl text-foreground font-mono">
          Initialized successfully.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <div className="px-6 py-3 rounded-md bg-themeCyan text-background font-bold cursor-pointer hover:opacity-90 transition-opacity">
            Discover
          </div>
          <div className="px-6 py-3 rounded-md border border-themeOrange text-themeOrange font-bold cursor-pointer hover:bg-themeOrange/10 transition-colors">
            Get Started
          </div>
        </div>
      </motion.div>
    </main>
  );
}
