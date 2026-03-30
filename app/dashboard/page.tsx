import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TasksView } from "@/components/dashboard/tasks-view"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <TasksView />
  )
}
