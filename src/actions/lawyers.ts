'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CreatePersonalDTO, UpdatePersonalDTO } from '@/types/database'

export async function createPersonal(data: CreatePersonalDTO) {
  const supabase = await createClient()

  const { error } = await supabase.from('personals').insert(data)

  if (error) return { error: error.message }

  // Actualizar rol del usuario a personal
  await supabase
    .from('profiles')
    .update({ role: 'personal' })
    .eq('id', data.user_id)

  revalidatePath('/personals')
  return { success: true }
}

export async function updatePersonal(id: string, data: UpdatePersonalDTO) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('personals')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/personals')
  revalidatePath(`/personals/${id}`)
  return { success: true }
}

export async function getPersonalByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personals')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}
