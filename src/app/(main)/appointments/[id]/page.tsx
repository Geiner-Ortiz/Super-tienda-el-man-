import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TurnoDetail } from '@/features/turnos/components/TurnoDetail'
import type { TurnoWithRelations } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Detalle de Turno | Tu Súper Tienda'
  }
}

export default async function TurnoDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener turno con relaciones
  const { data: turno, error } = await supabase
    .from('turnos')
    .select(`
      *,
      client:clients(*, profile:profiles(*)),
      personal:personals(*, profile:profiles(*)),
      turno_type:turno_types(*)
    `)
    .eq('id', id)
    .single()

  if (error || !turno) {
    notFound()
  }

  // Determinar rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role === 'personal' ? 'personal' : 'client'

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/turnos">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a turnos
          </Button>
        </Link>
      </div>

      <TurnoDetail
        turno={turno as TurnoWithRelations}
        userRole={userRole}
      />
    </div>
  )
}
