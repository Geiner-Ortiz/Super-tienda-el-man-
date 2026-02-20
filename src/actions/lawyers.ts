'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreateStaffDTO, UpdateStaffDTO } from '@/types/database'

export async function createStaff(data: CreateStaffDTO) {
  const supabase = await createClient()

  const { error } = await supabase.from('Staffs').insert(data)

  if (error) return { error: error.message }

  // Actualizar rol del usuario a Staff
  await supabase
    .from('profiles')
    .update({ role: 'Staff' })
    .eq('id', data.user_id)

  revalidatePath('/Staffs')
  return { success: true }
}

export async function updateStaff(id: string, data: UpdateStaffDTO) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('Staffs')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/Staffs')
  revalidatePath(`/Staffs/${id}`)
  return { success: true }
}

export async function getStaffByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Staffs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}
