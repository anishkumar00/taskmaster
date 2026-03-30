import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TaskMaster",
  description: "Next.js 14 task application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-background font-syne antialiased",
        syne.variable,
        jetBrainsMono.variable
      )}>
        {children}
      </body>
    </html>
  );
}
