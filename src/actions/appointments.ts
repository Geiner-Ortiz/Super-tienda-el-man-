'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CreateBookingDTO, UpdateBookingDTO, BookingStatus } from '@/types/database'

// Helper to send Booking emails
async function sendBookingEmails(params: {
  type: 'created' | 'status_changed'
  BookingId: string
  clientName: string
  clientEmail: string
  StaffName: string
  StaffEmail: string
  scheduledAt: string
  BookingType: string
  duration: number
  status?: 'confirmed' | 'cancelled' | 'completed'
}) {
  try {
    const scheduledDate = new Date(params.scheduledAt)
    const BookingDate = scheduledDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const BookingTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://saas-factory-theta.vercel.app'

    await fetch(`${baseUrl}/api/email/Booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: params.type,
        BookingId: params.BookingId,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        StaffName: params.StaffName,
        StaffEmail: params.StaffEmail,
        BookingDate,
        BookingTime,
        BookingType: params.BookingType,
        duration: params.duration,
        status: params.status,
      }),
    })
  } catch (error) {
    console.error('Error sending Booking emails:', error)
  }
}

export async function createBooking(data: CreateBookingDTO) {
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

  // Obtener datos del Personal
  const { data: Staff } = await supabase
    .from('Staffs')
    .select('user_id, profile:profiles(full_name, email)')
    .eq('id', data.Staff_id)
    .single()

  // Obtener tipo de cita
  const { data: BookingType } = await supabase
    .from('Booking_types')
    .select('name, duration_minutes')
    .eq('id', data.Booking_type_id)
    .single()

  const { data: Booking, error } = await supabase
    .from('Bookings')
    .insert({
      ...data,
      client_id: client.id,
      duration_minutes: BookingType?.duration_minutes || 30
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Send email notifications (non-blocking)
  if (Booking && Staff?.profile && clientProfile) {
    // Handle profile as it might be an array from the join
    const StaffProfileData = Array.isArray(Staff.profile) ? Staff.profile[0] : Staff.profile
    if (StaffProfileData) {
      sendBookingEmails({
        type: 'created',
        BookingId: Booking.id,
        clientName: clientProfile.full_name || 'Cliente',
        clientEmail: clientProfile.email,
        StaffName: StaffProfileData.full_name || 'Personal',
        StaffEmail: StaffProfileData.email,
        scheduledAt: data.scheduled_at,
        BookingType: BookingType?.name || 'Consulta',
        duration: BookingType?.duration_minutes || 30,
      })
    }
  }

  revalidatePath('/Bookings')
  redirect('/Bookings')
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  cancellationReason?: string
) {
  const supabase = await createClient()

  // Get Booking details for email
  const { data: Booking } = await supabase
    .from('Bookings')
    .select(`
      *,
      client:clients(user_id, profile:profiles(full_name, email)),
      Staff:Staffs(user_id, profile:profiles(full_name, email)),
      Booking_type:Booking_types(name)
    `)
    .eq('id', id)
    .single()

  const updateData: UpdateBookingDTO = { status }
  if (cancellationReason) {
    updateData.cancellation_reason = cancellationReason
  }

  const { error } = await supabase
    .from('Bookings')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  // Send email for status changes (confirmed, cancelled, completed)
  if (Booking && ['confirmed', 'cancelled', 'completed'].includes(status)) {
    // Handle profiles as they might be arrays from the join
    const clientProfileData = Array.isArray(Booking.client?.profile)
      ? Booking.client?.profile[0]
      : Booking.client?.profile
    const StaffProfileData = Array.isArray(Booking.Staff?.profile)
      ? Booking.Staff?.profile[0]
      : Booking.Staff?.profile

    if (clientProfileData && StaffProfileData) {
      sendBookingEmails({
        type: 'status_changed',
        BookingId: id,
        clientName: clientProfileData.full_name || 'Cliente',
        clientEmail: clientProfileData.email,
        StaffName: StaffProfileData.full_name || 'Personal',
        StaffEmail: StaffProfileData.email,
        scheduledAt: Booking.scheduled_at,
        BookingType: Booking.Booking_type?.name || 'Consulta',
        duration: Booking.duration_minutes,
        status: status as 'confirmed' | 'cancelled' | 'completed',
      })
    }
  }

  revalidatePath('/Bookings')
  revalidatePath(`/Bookings/${id}`)
  return { success: true }
}

export async function addBookingNotes(id: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('Bookings')
    .update({ notes })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/Bookings/${id}`)
  return { success: true }
}

export async function rescheduleBooking(id: string, newDate: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('Bookings')
    .update({ scheduled_at: newDate, status: 'pending' })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/Bookings')
  return { success: true }
}
