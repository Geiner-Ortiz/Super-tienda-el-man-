import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PricingManager } from './PricingManager'

export const metadata = {
  title: 'Gestión de Tienda | Tu Súper Tienda'
}

export default async function AdminPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar que sea admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Obtener tipos de cita existentes
  const { data: BookingTypes } = await supabase
    .from('Booking_types')
    .select('*')
    .order('name')

  // Obtener Personals con  // Fetch staff
  const { data: staff } = await supabase
    .from('staff')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Tienda</h1>
        <p className="text-foreground-secondary mt-1">
          Configura tus ganancias y gestiona tu equipo
        </p>
      </div>

      <PricingManager
        initialBookingTypes={BookingTypes || []}
        initialStaff={staff || []}
      />
    </div>
  )
}
