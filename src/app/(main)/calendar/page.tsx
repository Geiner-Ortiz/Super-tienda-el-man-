import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/features/calendar/components/CalendarView'

export const metadata = {
  title: 'Calendario | Tu Súper Tienda'
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar rol (solo admin y personal)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'client') {
    redirect('/dashboard')
  }

  // Obtener turnos del mes actual
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  let turnosQuery = supabase
    .from('turnos')
    .select(`
      *,
      client:clients(id, user_id, full_name, email, phone, address, notes, created_at, updated_at, profile:profiles(*)),
      personal:personals(*, profile:profiles(*)),
      turno_type:turno_types(*)
    `)
    .gte('scheduled_at', startOfMonth.toISOString())
    .lte('scheduled_at', endOfMonth.toISOString())
    .order('scheduled_at', { ascending: true })

  // Si es personal, solo sus turnos
  if (profile?.role === 'personal') {
    const { data: personal } = await supabase
      .from('personals')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (personal) {
      turnosQuery = turnosQuery.eq('personal_id', personal.id)
    }
  }

  const { data: turnos } = await turnosQuery

  // Obtener lista de personals para filtro (solo admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let personals: any[] = []
  if (profile?.role === 'admin') {
    const { data } = await supabase
      .from('personals')
      .select('id, profile:profiles(full_name)')
      .eq('is_active', true)

    // Transform the data to match expected format
    personals = (data || []).map((l: { id: string; profile: { full_name: string }[] | { full_name: string } }) => ({
      id: l.id,
      profile: Array.isArray(l.profile) ? l.profile[0] : l.profile
    }))
  }

  return (
    <div className="p-6 md:p-8">
      <CalendarView
        initialTurnos={turnos || []}
        personals={personals}
        userRole={profile?.role || 'client'}
      />
    </div>
  )
}
