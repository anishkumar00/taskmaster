import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileOverlay } from "@/components/dashboard/mobile-overlay";
import { StudyMode } from "@/components/dashboard/study-mode";
import { LevelUpToast } from "@/components/dashboard/level-up-toast";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Let's make sure the Supabase auth check is handled in layout too just in case middleware misses or we need session info (not strictly required but good practice)
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex xl:h-screen lg:h-screen md:h-screen h-screen w-full flex-col overflow-hidden bg-background font-syne text-foreground text-sm">
      <DashboardHeader />
      <StudyMode />
      <LevelUpToast />
      <div className="flex flex-1 overflow-hidden relative">
        <DashboardSidebar />
        <MobileOverlay />
        <main className="flex-1 overflow-y-auto bg-background transition-all pb-16 md:pb-0 z-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
