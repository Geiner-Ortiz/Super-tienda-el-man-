import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminBookingForm } from '@/features/booking/components/AdminBookingForm'

export const metadata = {
  title: 'Nueva Turno (Admin) | Tu Súper Tienda'
}

export default async function AdminNewTurnoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all active personals
  const { data: personals } = await supabase
    .from('personals')
    .select('id, specialty, profile:profiles(full_name, email)')
    .eq('is_active', true)

  // Get turno types
  const { data: turnoTypes } = await supabase
    .from('turno_types')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Get existing clients for autocomplete
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, email, phone')
    .order('full_name')
    .limit(100)

  const formattedPersonals = (personals || []).map((l: { id: string; specialty: string; profile: { full_name: string; email: string }[] | { full_name: string; email: string } }) => ({
    id: l.id,
    specialty: l.specialty,
    name: Array.isArray(l.profile) ? l.profile[0]?.full_name : l.profile?.full_name,
    email: Array.isArray(l.profile) ? l.profile[0]?.email : l.profile?.email
  }))

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Agendar Turno para Colaborador</h1>
        <p className="text-foreground-secondary mt-1">
          Crea una turno para cualquier personal del bufete
        </p>
      </div>

      <AdminBookingForm
        personals={formattedPersonals}
        turnoTypes={turnoTypes || []}
        existingClients={clients || []}
      />
    </div>
  )
}
