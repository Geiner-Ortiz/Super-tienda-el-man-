'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateTurnoStatus, addTurnoNotes } from '@/actions/turnos'
import type { TurnoWithRelations } from '@/types/database'

interface TurnoDetailProps {
    turno: TurnoWithRelations
    userRole: 'client' | 'personal'
}

export function TurnoDetail({ turno, userRole }: TurnoDetailProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [notes, setNotes] = useState(turno.notes || '')

    const handleStatusChange = async (status: 'confirmed' | 'cancelled' | 'completed') => {
        setLoading(true)
        const result = await updateTurnoStatus(turno.id, status)
        setLoading(false)

        if (result.error) {
            alert(result.error)
        } else {
            router.refresh()
        }
    }

    const handleSaveNotes = async () => {
        setLoading(true)
        const result = await addTurnoNotes(turno.id, notes)
        setLoading(false)

        if (result.error) {
            alert(result.error)
        }
    }

    const scheduledDate = new Date(turno.scheduled_at)
    const endTime = new Date(scheduledDate.getTime() + turno.duration_minutes * 60000)

    const statusVariant: Record<string, 'pending' | 'confirmed' | 'cancelled'> = {
        pending: 'pending',
        confirmed: 'confirmed',
        cancelled: 'cancelled',
        completed: 'confirmed',
        paid: 'confirmed',
        no_show: 'cancelled'
    }

    const statusLabel: Record<string, string> = {
        pending: 'Pendiente',
        confirmed: 'Confirmado',
        cancelled: 'Cancelado',
        completed: 'Completado',
        paid: 'Pagado',
        no_show: 'No asistió'
    }

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                            {turno.turno_type?.name || 'Reserva de Servicio'}
                        </h2>
                        <p className="text-foreground-secondary">
                            {turno.turno_type?.description}
                        </p>
                    </div>
                    <Badge variant={statusVariant[turno.status]}>
                        {statusLabel[turno.status]}
                    </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Fecha y Hora</h3>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {scheduledDate.toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' '}({turno.duration_minutes} min)
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-foreground mb-3">
                            {userRole === 'client' ? 'Personal' : 'Cliente'}
                        </h3>
                        <div className="flex items-center gap-3">
                            {userRole === 'client' ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                                        {turno.personal?.profile?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{turno.personal?.profile?.full_name}</p>
                                        <p className="text-sm text-foreground-secondary">{turno.personal?.specialty}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                        {turno.client?.profile?.full_name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{turno.client?.profile?.full_name}</p>
                                        <p className="text-sm text-foreground-secondary">{turno.client?.phone || 'Sin teléfono'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {turno.turno_type?.price && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-foreground-secondary">Costo del servicio</span>
                            <span className="text-xl font-semibold text-secondary-600">
                                ${turno.turno_type.price}
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            {userRole === 'personal' && (
                <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-3">Notas de gestión</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows={4}
                        placeholder="Agregar notas sobre el turno..."
                    />
                    <Button
                        onClick={handleSaveNotes}
                        disabled={loading}
                        className="mt-3"
                        size="sm"
                    >
                        Guardar notas
                    </Button>
                </Card>
            )}

            {turno.client_notes && (
                <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-3">Notas del cliente</h3>
                    <p className="text-foreground-secondary">{turno.client_notes}</p>
                </Card>
            )}

            {turno.status === 'pending' && (
                <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-4">Acciones</h3>
                    <div className="flex flex-wrap gap-3">
                        {userRole === 'personal' && (
                            <Button
                                onClick={() => handleStatusChange('confirmed')}
                                disabled={loading}
                            >
                                Confirmar Turno
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange('cancelled')}
                            disabled={loading}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                        >
                            Cancelar Turno
                        </Button>
                    </div>
                </Card>
            )}

            {turno.status === 'confirmed' && userRole === 'personal' && (
                <Card className="p-6">
                    <h3 className="font-medium text-foreground mb-4">Acciones</h3>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => handleStatusChange('completed')}
                            disabled={loading}
                        >
                            Marcar como Completado
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange('cancelled')}
                            disabled={loading}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                        >
                            Cancelar Turno
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
