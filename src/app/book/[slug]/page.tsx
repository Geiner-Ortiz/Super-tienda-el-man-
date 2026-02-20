import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicBookingPage } from './PublicBookingPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: personal } = await supabase
    .from('personals')
    .select('profile:profiles(full_name), specialty')
    .eq('id', slug)
    .single()

  if (!personal) {
    return { title: 'Personal no encontrado | Tu Súper Tienda' }
  }

  const profile = Array.isArray(personal.profile) ? personal.profile[0] : personal.profile

  return {
    title: `Agendar turno con ${profile?.full_name || 'Personal'} | Tu Súper Tienda`,
    description: `Agenda tu turno con ${profile?.full_name}. Especialidad: ${personal.specialty}`
  }
}

export default async function BookPersonalPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Try to find personal by ID or slug
  const { data: personal } = await supabase
    .from('personals')
    .select(`
      *,
      profile:profiles(id, full_name, email, avatar_url),
      availability(day_of_week, start_time, end_time, is_available)
    `)
    .eq('id', slug)
    .eq('is_active', true)
    .single()

  if (!personal) {
    notFound()
  }

  // Get turno types
  const { data: turnoTypes } = await supabase
    .from('turno_types')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  const profile = Array.isArray(personal.profile) ? personal.profile[0] : personal.profile

  return (
    <PublicBookingPage
      personal={{
        id: personal.id,
        name: profile?.full_name || 'Personal',
        email: profile?.email || '',
        avatar: profile?.avatar_url,
        specialty: personal.specialty,
        bio: personal.bio,
        experience_years: personal.experience_years,
        hourly_rate: personal.hourly_rate,
        rating: personal.rating,
        availability: personal.availability || []
      }}
      turnoTypes={turnoTypes || []}
    />
  )
}
