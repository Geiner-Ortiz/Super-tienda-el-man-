'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface AvailabilityData {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export async function updatePersonalAvailability(
  personalId: string,
  availabilities: AvailabilityData[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar que el usuario es el personal
  const { data: personal } = await supabase
    .from('personals')
    .select('id')
    .eq('id', personalId)
    .eq('user_id', user.id)
    .single()

  if (!personal) return { error: 'No autorizado' }

  // Eliminar disponibilidades existentes
  await supabase
    .from('availability')
    .delete()
    .eq('personal_id', personalId)

  // Insertar nuevas
  const { error } = await supabase
    .from('availability')
    .insert(
      availabilities.map(a => ({
        ...a,
        personal_id: personalId
      }))
    )

  if (error) return { error: error.message }

  revalidatePath(`/personals/${personalId}`)
  return { success: true }
}

export async function toggleDayAvailability(
  personalId: string,
  dayOfWeek: number,
  isAvailable: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('availability')
    .upsert({
      personal_id: personalId,
      day_of_week: dayOfWeek,
      is_available: isAvailable,
      start_time: '09:00:00',
      end_time: '18:00:00'
    }, {
      onConflict: 'personal_id,day_of_week'
    })

  if (error) return { error: error.message }

  revalidatePath(`/personals/${personalId}`)
  return { success: true }
}
