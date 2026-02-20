'use client'

import { useState, useEffect } from 'react'
import { personalService } from '../services/personalService'
import type { PersonalWithProfile } from '@/types/database'

export function usePersonals(options: { isActive?: boolean } = {}) {
    const [personals, setPersonals] = useState<PersonalWithProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            try {
                const data = await personalService.getAll(options)
                setPersonals(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar personal')
            } finally {
                setLoading(false)
            }
        }

        fetch()
    }, [options.isActive])

    return { personals, loading, error }
}

export function usePersonal(id: string) {
    const [personal, setPersonal] = useState<PersonalWithProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            if (!id) return
            try {
                const data = await personalService.getById(id)
                setPersonal(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar perfil')
            } finally {
                setLoading(false)
            }
        }

        fetch()
    }, [id])

    return { personal, loading, error }
}
