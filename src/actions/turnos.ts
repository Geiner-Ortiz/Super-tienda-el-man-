'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CreateTurnoDTO, UpdateTurnoDTO, TurnoStatus } from '@/types/database'

// Helper to send turno emails
async function sendTurnoEmails(params: {
  type: 'created' | 'status_changed'
  turnoId: string
  clientName: string
  clientEmail: string
  personalName: string
  personalEmail: string
  scheduledAt: string
  turnoType: string
  duration: number
  status?: 'confirmed' | 'cancelled' | 'completed'
}) {
  try {
    const scheduledDate = new Date(params.scheduledAt)
    const turnoDate = scheduledDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const turnoTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://saas-factory-theta.vercel.app'

    await fetch(`${baseUrl}/api/email/turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: params.type,
        turnoId: params.turnoId,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        personalName: params.personalName,
        personalEmail: params.personalEmail,
        turnoDate,
        turnoTime,
        turnoType: params.turnoType,
        duration: params.duration,
        status: params.status,
      }),
    })
  } catch (error) {
    console.error('Error sending turno emails:', error)
  }
}

export async function createTurno(data: CreateTurnoDTO) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Get client profile info
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Obtener o crear client_id del usuario
  let { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    // Auto-crear perfil de cliente si no existe
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    if (createError) return { error: createError.message }
    client = newClient
  }

  // Obtener datos del personal
  const { data: personal } = await supabase
    .from('personals')
    .select('user_id, profile:profiles(full_name, email)')
    .eq('id', data.personal_id)
    .single()

  // Obtener tipo de turno
  const { data: turnoType } = await supabase
    .from('turno_types')
    .select('name, duration_minutes')
    .eq('id', data.turno_type_id)
    .single()

  const { data: turno, error } = await supabase
    .from('turnos')
    .insert({
      ...data,
      client_id: client.id,
      duration_minutes: turnoType?.duration_minutes || 30
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Send email notifications (non-blocking)
  if (turno && personal?.profile && clientProfile) {
    // Handle profile as it might be an array from the join
    const personalProfileData = Array.isArray(personal.profile) ? personal.profile[0] : personal.profile
    if (personalProfileData) {
      sendTurnoEmails({
        type: 'created',
        turnoId: turno.id,
        clientName: clientProfile.full_name || 'Cliente',
        clientEmail: clientProfile.email,
        personalName: personalProfileData.full_name || 'Personal',
        personalEmail: personalProfileData.email,
        scheduledAt: data.scheduled_at,
        turnoType: turnoType?.name || 'Reserva',
        duration: turnoType?.duration_minutes || 30,
      })
    }
  }

  revalidatePath('/turnos')
  redirect('/turnos')
}

export async function updateTurnoStatus(
  id: string,
  status: TurnoStatus,
  cancellationReason?: string
) {
  const supabase = await createClient()

  // Get turno details for email
  const { data: turno } = await supabase
    .from('turnos')
    .select(`
      *,
      client:clients(user_id, profile:profiles(full_name, email)),
      personal:personals(user_id, profile:profiles(full_name, email)),
      turno_type:turno_types(name)
    `)
    .eq('id', id)
    .single()

  const updateData: UpdateTurnoDTO = { status }
  if (cancellationReason) {
    updateData.cancellation_reason = cancellationReason
  }

  const { error } = await supabase
    .from('turnos')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  // Send email for status changes (confirmed, cancelled, completed)
  if (turno && ['confirmed', 'cancelled', 'completed'].includes(status)) {
    // Handle profiles as they might be arrays from the join
    const clientProfileData = Array.isArray(turno.client?.profile)
      ? turno.client?.profile[0]
      : turno.client?.profile
    const personalProfileData = Array.isArray(turno.personal?.profile)
      ? turno.personal?.profile[0]
      : turno.personal?.profile

    if (clientProfileData && personalProfileData) {
      sendTurnoEmails({
        type: 'status_changed',
        turnoId: id,
        clientName: clientProfileData.full_name || 'Cliente',
        clientEmail: clientProfileData.email,
        personalName: personalProfileData.full_name || 'Personal',
        personalEmail: personalProfileData.email,
        scheduledAt: turno.scheduled_at,
        turnoType: turno.turno_type?.name || 'Reserva',
        duration: turno.duration_minutes,
        status: status as 'confirmed' | 'cancelled' | 'completed',
      })
    }
  }

  revalidatePath('/turnos')
  revalidatePath(`/turnos/${id}`)
  return { success: true }
}

export async function addTurnoNotes(id: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('turnos')
    .update({ notes })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/turnos/${id}`)
  return { success: true }
}

export async function rescheduleTurno(id: string, newDate: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('turnos')
    .update({ scheduled_at: newDate, status: 'pending' })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/turnos')
  return { success: true }
}
