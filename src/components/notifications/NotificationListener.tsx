'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * Componente invisible que escucha notificaciones en tiempo real + polling.
 * Se monta en el layout principal para garantizar que siempre esté activo,
 * incluso en móvil donde el sidebar está oculto.
 */
export function NotificationListener() {
    const [userId, setUserId] = useState<string | null>(null)

    // Obtener userId al montar
    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id)
        })
    }, [])

    useEffect(() => {
        if (!userId) return

        const supabase = createClient()
        const seenIds = new Set<string>()
        let lastCheckedAt = new Date(Date.now() - 60000).toISOString() // Empezar 1 minuto antes del montaje

        const showAlert = (title: string, message: string, type: string) => {
            const toastMethod = type === 'warning' ? toast.warning
                : type === 'success' ? toast.success
                    : type === 'info' ? toast.info
                        : toast.message

            toastMethod(title, {
                description: message,
                duration: 8000, // Un poco más largo para iPhone
            })

            // Push nativa (Android / escritorio)
            if ('Notification' in window && Notification.permission === 'granted') {
                const notifOptions = {
                    body: message,
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                    vibrate: [200, 100, 200] as number[],
                }

                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification(title, notifOptions).catch(() => { })
                    })
                } else {
                    try {
                        const browserNotif = new window.Notification(title, notifOptions)
                        browserNotif.onclick = () => {
                            window.focus()
                            browserNotif.close()
                        }
                    } catch { }
                }
            }

            // Sonido
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => { })
        }

        // Inicializar: Ver qué notificaciones ya existen para no duplicarlas
        supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)
            .then(({ data }) => {
                if (data) data.forEach(n => seenIds.add(n.id))
            })

        // Real-time
        const channel = supabase
            .channel('global-alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const n = payload.new as { id: string; title: string; message: string; type: string }
                    if (seenIds.has(n.id)) return
                    seenIds.add(n.id)
                    showAlert(n.title, n.message, n.type)
                    lastCheckedAt = new Date().toISOString()
                }
            )
            .subscribe()

        // Polling cada 10s (Fuerte respaldo para iOS)
        const pollInterval = setInterval(async () => {
            try {
                const { data } = await supabase
                    .from('notifications')
                    .select('id, title, message, type, created_at')
                    .eq('user_id', userId)
                    .gt('created_at', lastCheckedAt)
                    .order('created_at', { ascending: false })

                if (data && data.length > 0) {
                    data.forEach(n => {
                        if (!seenIds.has(n.id)) {
                            seenIds.add(n.id)
                            showAlert(n.title, n.message, n.type)
                        }
                    })
                    lastCheckedAt = new Date().toISOString()
                }
            } catch { }
        }, 10000) // 10 segundos para máxima respuesta

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [userId])

    // Este componente no renderiza nada visible
    return null
}
