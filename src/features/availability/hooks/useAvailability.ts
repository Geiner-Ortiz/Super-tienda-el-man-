'use client'

import { useState, useEffect, useCallback } from 'react'
import { availabilityService } from '../services/availabilityService'
import type { Availability } from '@/types/database'

export function useAvailableSlots(personalId: string, date: Date | null) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSlots = useCallback(async () => {
    if (!date) {
      setSlots([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await availabilityService.getAvailableSlots(personalId, date)
      setSlots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [personalId, date])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  return { slots, loading, error, refetch: fetchSlots }
}

export function usePersonalAvailability(personalId: string) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await availabilityService.getPersonalAvailability(personalId)
        setAvailability(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar disponibilidad')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [personalId])

  return { availability, loading, error }
}
