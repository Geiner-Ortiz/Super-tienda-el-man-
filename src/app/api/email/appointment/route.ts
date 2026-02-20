import { NextRequest, NextResponse } from 'next/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import {
  BookingCreatedClientEmail,
  BookingCreatedStaffEmail,
  BookingCreatedAdminEmail,
  BookingStatusChangedEmail,
} from '@/lib/email'

// Admin email to receive all notifications
const ADMIN_EMAIL = 'sinsajo.creators@gmail.com'

interface BookingEmailRequest {
  type: 'created' | 'status_changed'
  BookingId: string
  clientName: string
  clientEmail: string
  StaffName: string
  StaffEmail: string
  BookingDate: string
  BookingTime: string
  BookingType: string
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
    const body: BookingEmailRequest = await request.json()

    const {
      type,
      BookingId,
      clientName,
      clientEmail,
      StaffName,
      StaffEmail,
      BookingDate,
      BookingTime,
      BookingType,
      duration,
      status,
    } = body

    const emailData = {
      clientName,
      StaffName,
      BookingDate,
      BookingTime,
      BookingType,
      duration,
      BookingId,
    }

    const emailPromises: Promise<unknown>[] = []

    if (type === 'created') {
      // Email to client
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: clientEmail,
          subject: `Cita Confirmada con ${StaffName} - Tu Súper Tienda`,
          html: BookingCreatedClientEmail(emailData),
        })
      )

      // Email to Staff
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: StaffEmail,
          subject: `Nueva Cita: ${clientName} - ${BookingDate} - Tu Súper Tienda`,
          html: BookingCreatedStaffEmail(emailData),
        })
      )

      // Email to admin (if Staff is not admin)
      if (StaffEmail !== ADMIN_EMAIL) {
        emailPromises.push(
          resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: ADMIN_EMAIL,
            subject: `[Admin] Nueva Cita: ${clientName} con ${StaffName} - Tu Súper Tienda`,
            html: BookingCreatedAdminEmail(emailData),
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
          subject: `Cita ${statusLabels[status]} - Tu Súper Tienda`,
          html: BookingStatusChangedEmail({ ...emailData, status, recipientType: 'client' }),
        })
      )

      // Email to Staff
      emailPromises.push(
        resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: StaffEmail,
          subject: `Cita ${statusLabels[status]}: ${clientName} - Tu Súper Tienda`,
          html: BookingStatusChangedEmail({ ...emailData, status, recipientType: 'Staff' }),
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
    console.error('Error sending Booking emails:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
