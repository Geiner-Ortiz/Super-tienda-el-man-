import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface BookingRequest {
  personalId: string
  turnoTypeId: string
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
    const { personalId, turnoTypeId, scheduledAt, client } = body

    // Validate required fields
    if (!personalId || !turnoTypeId || !scheduledAt || !client.name || !client.email || !client.phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get turno type details
    const { data: turnoType, error: typeError } = await supabase
      .from('turno_types')
      .select('name, duration_minutes, price')
      .eq('id', turnoTypeId)
      .single()

    if (typeError || !turnoType) {
      return NextResponse.json(
        { error: 'Tipo de turno no encontrado' },
        { status: 404 }
      )
    }

    // Get personal details for email notification
    const { data: personal, error: personalError } = await supabase
      .from('personals')
      .select('user_id, profile:profiles(full_name, email)')
      .eq('id', personalId)
      .single()

    if (personalError || !personal) {
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

    // Create the turno
    const { data: turno, error: turnoError } = await supabase
      .from('turnos')
      .insert({
        personal_id: personalId,
        client_id: clientId,
        turno_type_id: turnoTypeId,
        scheduled_at: scheduledAt,
        duration_minutes: turnoType.duration_minutes,
        status: 'pending',
        notes: client.description || null
      })
      .select('id')
      .single()

    if (turnoError) {
      console.error('Error creating turno:', turnoError)
      return NextResponse.json(
        { error: 'Error al crear turno: ' + turnoError.message },
        { status: 500 }
      )
    }

    // Send email notifications (non-blocking)
    try {
      const personalProfile = Array.isArray(personal.profile) ? personal.profile[0] : personal.profile
      const scheduledDate = new Date(scheduledAt)
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
          type: 'created',
          turnoId: turno.id,
          clientName: client.name,
          clientEmail: client.email,
          personalName: personalProfile?.full_name || 'Personal',
          personalEmail: personalProfile?.email || '',
          turnoDate,
          turnoTime,
          turnoType: turnoType.name,
          duration: turnoType.duration_minutes,
        }),
      })
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      turnoId: turno.id,
      message: 'Turno creada exitosamente'
    })

  } catch (error) {
    console.error('Public booking error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
