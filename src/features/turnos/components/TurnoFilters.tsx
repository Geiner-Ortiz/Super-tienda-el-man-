'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { TurnoStatus } from '@/types/database'

const STATUSES: { value: TurnoStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' }
]

export function TurnoFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentStatus = searchParams.get('status') || 'all'

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (status === 'all') {
            params.delete('status')
        } else {
            params.set('status', status)
        }
        router.push(`/turnos?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {STATUSES.map(status => (
                <Button
                    key={status.value}
                    variant={currentStatus === status.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(status.value)}
                >
                    {status.label}
                </Button>
            ))}
        </div>
    )
}
