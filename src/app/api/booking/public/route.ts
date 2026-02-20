import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface BookingRequest {
  StaffId: string
  BookingTypeId: string
  scheduledAt: string
  client: {
    name: string
    email: string
    phone: string
    description?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()
    const { StaffId, BookingTypeId, scheduledAt, client } = body

    // Validate required fields
    if (!StaffId || !BookingTypeId || !scheduledAt || !client.name || !client.email || !client.phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get Booking type details
    const { data: BookingType, error: typeError } = await supabase
      .from('Booking_types')
      .select('name, duration_minutes, price')
      .eq('id', BookingTypeId)
      .single()

    if (typeError || !BookingType) {
      return NextResponse.json(
        { error: 'Tipo de cita no encontrado' },
        { status: 404 }
      )
    }

    // Get Staff details for email notification
    const { data: Staff, error: StaffError } = await supabase
      .from('Staffs')
      .select('user_id, profile:profiles(full_name, email)')
      .eq('id', StaffId)
      .single()

    if (StaffError || !Staff) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      )
    }

    // Check if a client with this email already exists
    let clientId: string

    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', client.email)
      .single()

    if (existingClient) {
      clientId = existingClient.id

      // Update client info
      await supabase
        .from('clients')
        .update({
          full_name: client.name,
          phone: client.phone
        })
        .eq('id', clientId)
    } else {
      // Create new guest client
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          full_name: client.name,
          email: client.email,
          phone: client.phone,
          user_id: null // Guest client, no user account
        })
        .select('id')
        .single()

      if (createClientError) {
        console.error('Error creating client:', createClientError)
        return NextResponse.json(
          { error: 'Error al crear cliente: ' + createClientError.message },
          { status: 500 }
        )
      }

      clientId = newClient.id
    }

    // Create the Booking
    const { data: Booking, error: BookingError } = await supabase
      .from('Bookings')
      .insert({
        Staff_id: StaffId,
        client_id: clientId,
        Booking_type_id: BookingTypeId,
        scheduled_at: scheduledAt,
        duration_minutes: BookingType.duration_minutes,
        status: 'pending',
        notes: client.description || null
      })
      .select('id')
      .single()

    if (BookingError) {
      console.error('Error creating Booking:', BookingError)
      return NextResponse.json(
        { error: 'Error al crear cita: ' + BookingError.message },
        { status: 500 }
      )
    }

    // Send email notifications (non-blocking)
    try {
      const StaffProfile = Array.isArray(Staff.profile) ? Staff.profile[0] : Staff.profile
      const scheduledDate = new Date(scheduledAt)
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
          type: 'created',
          BookingId: Booking.id,
          clientName: client.name,
          clientEmail: client.email,
          StaffName: StaffProfile?.full_name || 'Personal',
          StaffEmail: StaffProfile?.email || '',
          BookingDate,
          BookingTime,
          BookingType: BookingType.name,
          duration: BookingType.duration_minutes,
        }),
      })
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      BookingId: Booking.id,
      message: 'Cita creada exitosamente'
    })

  } catch (error) {
    console.error('Public booking error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
