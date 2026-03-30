import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HabitsView } from "@/components/dashboard/habits-view"

export default async function HabitsPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <HabitsView />
  )
}
