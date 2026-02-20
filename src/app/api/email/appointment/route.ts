import { NextRequest, NextResponse } from 'next/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import {
  turnoCreatedClientEmail,
  turnoCreatedPersonalEmail,
  turnoCreatedAdminEmail,
  turnoStatusChangedEmail,
} from '@/lib/email'

// Admin email to receive all notifications
const ADMIN_EMAIL = 'sinsajo.creators@gmail.com'

interface TurnoEmailRequest {
  type: 'created' | 'status_changed'
  turnoId: string
  clientName: string
  clientEmail: string
  personalName: string
  personalEmail: string
  turnoDate: string
  turnoTime: string
  turnoType: string
  duration: number
  status?: 'confirmed' | 'cancelled' | 'completed'
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return NextResponse.json({ success: true, sent: 0, failed: 0, message: 'Email not configured' })
    }

    const resend = getResend()
    const body: TurnoEmailRequest = await request.json()

    const {
      type,
      turnoId,
      clientName,
      clientEmail,
      personalName,
      personalEmail,
      turnoDate,
      turnoTime,
      turnoType,
      duration,
      status,
    } = body

    const emailData = {
      clientName,
      personalName,
      turnoDate,
      turnoTime,
      turnoType,
      duration,
      turnoId,
    }

    const emailPromises: Promise<unknown>[] = []

    if (type === 'created') {
      // Email to client
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: clientEmail,
          subject: `Turno Confirmada con ${personalName} - Tu Súper Tienda`,
          html: turnoCreatedClientEmail(emailData),
        })
      )

      // Email to personal
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: personalEmail,
          subject: `Nueva Turno: ${clientName} - ${turnoDate} - Tu Súper Tienda`,
          html: turnoCreatedPersonalEmail(emailData),
        })
      )

      // Email to admin (if personal is not admin)
      if (personalEmail !== ADMIN_EMAIL) {
        emailPromises.push(
          resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: ADMIN_EMAIL,
            subject: `[Admin] Nueva Turno: ${clientName} con ${personalName} - Tu Súper Tienda`,
            html: turnoCreatedAdminEmail(emailData),
          })
        )
      }
    } else if (type === 'status_changed' && status) {
      const statusLabels = {
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        completed: 'Completada',
      }

      // Email to client
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: clientEmail,
          subject: `Turno ${statusLabels[status]} - Tu Súper Tienda`,
          html: turnoStatusChangedEmail({ ...emailData, status, recipientType: 'client' }),
        })
      )

      // Email to personal
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: personalEmail,
          subject: `Turno ${statusLabels[status]}: ${clientName} - Tu Súper Tienda`,
          html: turnoStatusChangedEmail({ ...emailData, status, recipientType: 'personal' }),
        })
      )
    }

    // Send all emails in parallel
    const results = await Promise.allSettled(emailPromises)

    // Check for any failures
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures)
    }

    return NextResponse.json({
      success: true,
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: failures.length,
    })
  } catch (error) {
    console.error('Error sending turno emails:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
