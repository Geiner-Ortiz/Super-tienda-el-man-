'use client'

import { useState, useEffect, useCallback } from 'react'
import { turnoService } from '../services/turnoService'
import type { TurnoWithRelations, TurnoStatus } from '@/types/database'

interface UseTurnosOptions {
  clientId?: string
  personalId?: string
  status?: TurnoStatus
}

export function useTurnos(options: UseTurnosOptions = {}) {
  const [turnos, setTurnos] = useState<TurnoWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data: TurnoWithRelations[]

      if (options.clientId) {
        data = await turnoService.getByClient(options.clientId)
      } else if (options.personalId) {
        data = await turnoService.getByPersonal(options.personalId)
      } else {
        data = []
      }

      if (options.status) {
        data = data.filter(a => a.status === options.status)
      }

      setTurnos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar turnos')
    } finally {
      setLoading(false)
    }
  }, [options.clientId, options.personalId, options.status])

  useEffect(() => {
    fetchTurnos()
  }, [fetchTurnos])

  return { turnos, loading, error, refetch: fetchTurnos }
}

export function useTurno(id: string) {
  const [turno, setTurno] = useState<TurnoWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await turnoService.getById(id)
        setTurno(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar turno')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  return { turno, loading, error }
}

export function useTurnoTypes() {
  const [types, setTypes] = useState<Awaited<ReturnType<typeof turnoService.getTurnoTypes>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await turnoService.getTurnoTypes()
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
