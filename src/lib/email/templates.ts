// Email templates for Tu Súper Tienda

interface BookingEmailData {
  clientName: string
  StaffName: string
  BookingDate: string
  BookingTime: string
  BookingType: string
  duration: number
  BookingId: string
}

const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
  .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
  .content { padding: 32px; }
  .greeting { font-size: 18px; color: #1f2937; margin-bottom: 16px; }
  .message { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
  .details-card { background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .details-card h3 { color: #1e40af; margin: 0 0 16px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #6b7280; font-size: 14px; }
  .detail-value { color: #1f2937; font-weight: 600; font-size: 14px; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; }
  .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { color: #6b7280; font-size: 12px; margin: 4px 0; }
  .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
  .status-confirmed { background-color: #d1fae5; color: #065f46; }
  .status-cancelled { background-color: #fee2e2; color: #991b1b; }
`

export function BookingCreatedClientEmail(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Confirmada - Tu Súper Tienda</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tu Súper Tienda</h1>
      <p>Tu cita ha sido agendada</p>
    </div>
    <div class="content">
      <p class="greeting">Hola ${data.clientName},</p>
      <p class="message">
        Tu cita con <strong>${data.StaffName}</strong> ha sido agendada exitosamente.
        A continuaci&oacute;n encontrar&aacute;s los detalles de tu cita.
      </p>

      <div class="details-card">
        <h3>Detalles de la Cita</h3>
        <div class="detail-row">
          <span class="detail-label">Personal</span>
          <span class="detail-value">${data.StaffName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${data.BookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora</span>
          <span class="detail-value">${data.BookingTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo de Consulta</span>
          <span class="detail-value">${data.BookingType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duraci&oacute;n</span>
          <span class="detail-value">${data.duration} minutos</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://saas-factory-theta.vercel.app/Bookings/${data.BookingId}" class="cta-button">
          Ver Mi Cita
        </a>
      </div>

      <p class="message" style="margin-top: 24px; font-size: 14px;">
        <strong>Importante:</strong> Si necesitas cancelar o reprogramar tu cita,
        por favor hazlo con al menos 24 horas de anticipaci&oacute;n.
      </p>
    </div>
    <div class="footer">
      <p>Este correo fue enviado autom&aacute;ticamente por Tu Súper Tienda</p>
      <p>&copy; ${new Date().getFullYear()} Tu Súper Tienda - Gesti&oacute;n Legal Inteligente</p>
    </div>
  </div>
</body>
</html>
`
}

export function BookingCreatedStaffEmail(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cita Agendada - Tu Súper Tienda</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tu Súper Tienda</h1>
      <p>Nueva cita agendada</p>
    </div>
    <div class="content">
      <p class="greeting">Hola ${data.StaffName},</p>
      <p class="message">
        El cliente <strong>${data.clientName}</strong> ha agendado una cita contigo.
        A continuaci&oacute;n encontrar&aacute;s los detalles.
      </p>

      <div class="details-card">
        <h3>Detalles de la Cita</h3>
        <div class="detail-row">
          <span class="detail-label">Cliente</span>
          <span class="detail-value">${data.clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${data.BookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora</span>
          <span class="detail-value">${data.BookingTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo de Consulta</span>
          <span class="detail-value">${data.BookingType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duraci&oacute;n</span>
          <span class="detail-value">${data.duration} minutos</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://saas-factory-theta.vercel.app/Bookings/${data.BookingId}" class="cta-button">
          Ver Cita
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Este correo fue enviado autom&aacute;ticamente por Tu Súper Tienda</p>
      <p>&copy; ${new Date().getFullYear()} Tu Súper Tienda - Gesti&oacute;n Legal Inteligente</p>
    </div>
  </div>
</body>
</html>
`
}

export function BookingCreatedAdminEmail(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cita en el Sistema - Tu Súper Tienda</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
      <h1>Tu Súper Tienda Admin</h1>
      <p>Nueva cita registrada en el sistema</p>
    </div>
    <div class="content">
      <p class="greeting">Notificaci&oacute;n de Administrador</p>
      <p class="message">
        Se ha registrado una nueva cita en el sistema Tu Súper Tienda.
      </p>

      <div class="details-card">
        <h3>Detalles de la Cita</h3>
        <div class="detail-row">
          <span class="detail-label">Cliente</span>
          <span class="detail-value">${data.clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Personal</span>
          <span class="detail-value">${data.StaffName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${data.BookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora</span>
          <span class="detail-value">${data.BookingTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo de Consulta</span>
          <span class="detail-value">${data.BookingType}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://saas-factory-theta.vercel.app/admin/analytics" class="cta-button" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
          Ver Analytics
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Notificaci&oacute;n autom&aacute;tica del sistema Tu Súper Tienda</p>
      <p>&copy; ${new Date().getFullYear()} Tu Súper Tienda</p>
    </div>
  </div>
</body>
</html>
`
}

export function BookingStatusChangedEmail(
  data: BookingEmailData & { status: 'confirmed' | 'cancelled' | 'completed'; recipientType: 'client' | 'Staff' }
): string {
  const statusConfig = {
    confirmed: { label: 'Confirmada', class: 'status-confirmed', message: 'Tu cita ha sido confirmada' },
    cancelled: { label: 'Cancelada', class: 'status-cancelled', message: 'Tu cita ha sido cancelada' },
    completed: { label: 'Completada', class: 'status-confirmed', message: 'Tu cita ha sido marcada como completada' },
  }

  const config = statusConfig[data.status]
  const recipientName = data.recipientType === 'client' ? data.clientName : data.StaffName
  const otherParty = data.recipientType === 'client' ? data.StaffName : data.clientName
  const otherPartyLabel = data.recipientType === 'client' ? 'Personal' : 'Cliente'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita ${config.label} - Tu Súper Tienda</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tu Súper Tienda</h1>
      <p>${config.message}</p>
    </div>
    <div class="content">
      <p class="greeting">Hola ${recipientName},</p>

      <div style="text-align: center; margin-bottom: 24px;">
        <span class="status-badge ${config.class}">${config.label}</span>
      </div>

      <div class="details-card">
        <h3>Detalles de la Cita</h3>
        <div class="detail-row">
          <span class="detail-label">${otherPartyLabel}</span>
          <span class="detail-value">${otherParty}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${data.BookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hora</span>
          <span class="detail-value">${data.BookingTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo de Consulta</span>
          <span class="detail-value">${data.BookingType}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://saas-factory-theta.vercel.app/Bookings/${data.BookingId}" class="cta-button">
          Ver Detalles
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Este correo fue enviado autom&aacute;ticamente por Tu Súper Tienda</p>
      <p>&copy; ${new Date().getFullYear()} Tu Súper Tienda - Gesti&oacute;n Legal Inteligente</p>
    </div>
  </div>
</body>
</html>
`
}
