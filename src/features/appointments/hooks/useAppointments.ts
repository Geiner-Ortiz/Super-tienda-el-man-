'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookingService } from '../services/BookingService'
import type { BookingWithRelations, BookingStatus } from '@/types/database'

interface UseBookingsOptions {
  clientId?: string
  StaffId?: string
  status?: BookingStatus
}

export function useBookings(options: UseBookingsOptions = {}) {
  const [Bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data: BookingWithRelations[]

      if (options.clientId) {
        data = await BookingService.getByClient(options.clientId)
      } else if (options.StaffId) {
        data = await BookingService.getByStaff(options.StaffId)
      } else {
        data = []
      }

      if (options.status) {
        data = data.filter(a => a.status === options.status)
      }

      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }, [options.clientId, options.StaffId, options.status])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return { Bookings, loading, error, refetch: fetchBookings }
}

export function useBooking(id: string) {
  const [Booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await BookingService.getById(id)
        setBooking(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cita')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  return { Booking, loading, error }
}

export function useBookingTypes() {
  const [types, setTypes] = useState<Awaited<ReturnType<typeof BookingService.getBookingTypes>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await BookingService.getBookingTypes()
        setTypes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar tipos')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { types, loading, error }
}
