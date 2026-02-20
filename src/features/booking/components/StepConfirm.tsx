'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBooking } from '@/actions/Bookings'
import { useBookingStore } from '../store/bookingStore'
import { StaffService } from '@/features/Staffs/services/StaffService'
import { BookingService } from '@/features/Bookings/services/BookingService'
import type { StaffWithProfile, BookingType } from '@/types/database'

export function StepConfirm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [Staff, setStaff] = useState<StaffWithProfile | null>(null)
  const [BookingType, setBookingType] = useState<BookingType | null>(null)

  const {
    StaffId,
    BookingTypeId,
    selectedDate,
    selectedTime,
    clientNotes,
    setNotes,
    prevStep,
    reset
  } = useBookingStore()

  // Cargar datos del Personal y tipo de cita
  useEffect(() => {
    async function loadData() {
      if (StaffId) {
        const l = await StaffService.getById(StaffId)
        setStaff(l)
      }
      if (BookingTypeId) {
        const types = await BookingService.getBookingTypes()
        const t = types.find(t => t.id === BookingTypeId)
        if (t) setBookingType(t)
      }
    }
    loadData()
  }, [StaffId, BookingTypeId])

  const handleConfirm = async () => {
    if (!StaffId || !BookingTypeId || !selectedDate || !selectedTime) {
      return
    }

    setLoading(true)
    setError(null)

    // Construir fecha completa
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const result = await createBooking({
      Staff_id: StaffId,
      Booking_type_id: BookingTypeId,
      scheduled_at: scheduledAt.toISOString(),
      client_notes: clientNotes || undefined
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      reset()
      router.push('/Bookings')
    }
  }

  if (!Staff || !BookingType || !selectedDate || !selectedTime) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary">Cargando resumen...</p>
      </div>
    )
  }

  const initials = Staff.profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Confirma tu cita
      </h3>

      {/* Resumen de la cita */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Personal */}
          <div className="flex items-center gap-4">
            {Staff.profile?.avatar_url ? (
              <img
                src={Staff.profile.avatar_url}
                alt={Staff.profile.full_name || 'Personal'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-lg">
                {initials}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-foreground">
                {Staff.profile?.full_name}
              </h4>
              <p className="text-sm text-accent-500">{Staff.specialty}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Detalles */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-muted mb-1">Tipo de consulta</p>
              <p className="font-medium text-foreground">{BookingType.name}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-1">Duración</p>
              <p className="font-medium text-foreground">{BookingType.duration_minutes} minutos</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-1">Fecha</p>
              <p className="font-medium text-foreground">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-1">Hora</p>
              <p className="font-medium text-foreground">{selectedTime}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Precio */}
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary">Costo de la consulta</span>
            <span className="text-2xl font-bold text-secondary-600">
              ${BookingType.price}
            </span>
          </div>
        </div>
      </Card>

      {/* Notas adicionales */}
      <Card className="p-6">
        <label className="block">
          <span className="text-sm font-medium text-foreground mb-2 block">
            Notas adicionales (opcional)
          </span>
          <textarea
            value={clientNotes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Describe brevemente el motivo de tu consulta..."
          />
        </label>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-600 text-sm">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={loading}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </Button>
        <Button onClick={handleConfirm} disabled={loading} size="lg">
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </>
          ) : (
            <>
              Confirmar Cita
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
