import { createClient } from '@/lib/supabase/client'
import type { PersonalWithProfile } from '@/types/database'

export const personalService = {
    async getById(id: string): Promise<PersonalWithProfile | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('personals')
            .select(`
        *,
        profile:profiles(*)
      `)
            .eq('id', id)
            .single()

        if (error) return null
        return data as PersonalWithProfile
    },

    async getAll(options: { isActive?: boolean } = {}): Promise<PersonalWithProfile[]> {
        const supabase = createClient()
        let query = supabase
            .from('personals')
            .select(`
        *,
        profile:profiles(*)
      `)

        if (options.isActive !== undefined) {
            query = query.eq('is_active', options.isActive)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []) as PersonalWithProfile[]
    }
}
