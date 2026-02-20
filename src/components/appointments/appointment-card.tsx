import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import Link from 'next/link'

export interface Booking {
  id: string
  staffName: string
  staffRole: string
  clientName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'paid' | 'no_show'
  type: string
  avatarUrl?: string | null
  notes?: string
}

interface BookingCardProps {
  Booking: Booking
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
  onReschedule?: (id: string) => void
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  paid: 'Pagada',
  no_show: 'No asistió',
}

const statusVariant: Record<string, 'pending' | 'confirmed' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'confirmed',
  paid: 'confirmed',
  no_show: 'cancelled',
}

export function BookingCard({ Booking, onConfirm, onCancel, onReschedule }: BookingCardProps) {
  const initials = Booking.staffName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/Bookings/${Booking.id}`}>
      <Card variant="gold-accent" className="hover:shadow-card-hover transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          {Booking.avatarUrl ? (
            <img
              src={Booking.avatarUrl}
              alt={Booking.staffName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-semibold text-foreground truncate">{Booking.staffName}</h3>
              <Badge variant={statusVariant[Booking.status]}>
                {statusLabels[Booking.status]}
              </Badge>
            </div>

            {Booking.staffRole && (
              <p className="text-sm text-accent-500 mb-2">{Booking.staffRole}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground-secondary">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {Booking.date}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {Booking.time}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {Booking.type}
              </span>
            </div>

            {Booking.notes && (
              <p className="mt-3 text-sm text-foreground-muted bg-gray-50 p-3 rounded-lg line-clamp-2">
                {Booking.notes}
              </p>
            )}
          </div>
        </div>

        {Booking.status === 'pending' && (onConfirm || onCancel || onReschedule) && (
          <div className="mt-4 pt-4 border-t border-border flex gap-3" onClick={e => e.preventDefault()}>
            {onConfirm && (
              <Button size="sm" onClick={() => onConfirm(Booking.id)}>
                Confirmar
              </Button>
            )}
            {onReschedule && (
              <Button size="sm" variant="outline" onClick={() => onReschedule(Booking.id)}>
                Reagendar
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="ghost" onClick={() => onCancel(Booking.id)}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </Card>
    </Link>
  )
}
