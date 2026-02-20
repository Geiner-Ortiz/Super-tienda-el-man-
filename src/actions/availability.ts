'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface AvailabilityData {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export async function updateStaffAvailability(
  StaffId: string,
  availabilities: AvailabilityData[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar que el usuario es el Personal
  const { data: Staff } = await supabase
    .from('Staffs')
    .select('id')
    .eq('id', StaffId)
    .eq('user_id', user.id)
    .single()

  if (!Staff) return { error: 'No autorizado' }

  // Eliminar disponibilidades existentes
  await supabase
    .from('availability')
    .delete()
    .eq('Staff_id', StaffId)

  // Insertar nuevas
  const { error } = await supabase
    .from('availability')
    .insert(
      availabilities.map(a => ({
        ...a,
        Staff_id: StaffId
      }))
    )

  if (error) return { error: error.message }

  revalidatePath(`/Staffs/${StaffId}`)
  return { success: true }
}

export async function toggleDayAvailability(
  StaffId: string,
  dayOfWeek: number,
  isAvailable: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('availability')
    .upsert({
      Staff_id: StaffId,
      day_of_week: dayOfWeek,
      is_available: isAvailable,
      start_time: '09:00:00',
      end_time: '18:00:00'
    }, {
      onConflict: 'Staff_id,day_of_week'
    })

  if (error) return { error: error.message }

  revalidatePath(`/Staffs/${StaffId}`)
  return { success: true }
}
