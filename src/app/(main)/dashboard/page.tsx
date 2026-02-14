import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContainer } from '@/features/dashboard/components/DashboardContainer'

export const metadata = {
  title: 'Dashboard | Abarrotes Profit'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <DashboardContainer />
    </div>
  )
}
