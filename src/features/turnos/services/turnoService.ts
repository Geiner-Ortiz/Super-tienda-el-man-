import { createClient } from '@/lib/supabase/client'
import type { TurnoWithRelations } from '@/types/database'

export const turnoService = {
  async getByClient(clientId: string): Promise<TurnoWithRelations[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        personal:personals(*, profile:profiles(*)),
        turno_type:turno_types(*)
      `)
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data as TurnoWithRelations[]
  },

  async getByPersonal(personalId: string): Promise<TurnoWithRelations[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        personal:personals(*, profile:profiles(*)),
        turno_type:turno_types(*)
      `)
      .eq('personal_id', personalId)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data as TurnoWithRelations[]
  },

  async getById(id: string): Promise<TurnoWithRelations | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        personal:personals(*, profile:profiles(*)),
        turno_type:turno_types(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data as TurnoWithRelations
  },

  async getTurnoTypes() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('turno_types')
      .select('*')
      .eq('is_active', true)
      .order('price')

    if (error) throw error
    return data
  }
}
