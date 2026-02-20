import { createClient } from '@/lib/supabase/server'
import { TurnosCalendar } from '@/features/turnos/components/TurnosCalendar'
import type { TurnoWithRelations } from '@/types/database'

interface TurnosListServerProps {
    userId: string
    userRole: 'client' | 'personal' | 'admin'
}

export async function TurnosListServer({ userId, userRole }: TurnosListServerProps) {
    const supabase = await createClient()

    let query = supabase
        .from('turnos')
        .select(`
      *,
      client:clients(*, profile:profiles(*)),
      personal:personals(*, profile:profiles(*)),
      turno_type:turno_types(*)
    `)
        .order('scheduled_at', { ascending: true })

    if (userRole === 'client') {
        const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (client) {
            query = query.eq('client_id', client.id)
        } else {
            return <TurnosCalendar turnos={[]} userRole={userRole} />
        }
    } else if (userRole === 'personal') {
        const { data: personal } = await supabase
            .from('personals')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (personal) {
            query = query.eq('personal_id', personal.id)
        } else {
            return <TurnosCalendar turnos={[]} userRole={userRole} />
        }
    }

    const { data: turnos, error } = await query

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-error-500">Error al cargar turnos: {error.message}</p>
            </div>
        )
    }

    return (
        <TurnosCalendar
            turnos={turnos as TurnoWithRelations[]}
            userRole={userRole}
        />
    )
}
