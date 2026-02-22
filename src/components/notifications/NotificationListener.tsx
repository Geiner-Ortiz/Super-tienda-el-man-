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
        let lastCheckedAt = new Date().toISOString()

        const showAlert = (title: string, message: string, type: string) => {
            const toastMethod = type === 'warning' ? toast.warning
                : type === 'success' ? toast.success
                    : type === 'info' ? toast.info
                        : toast.message

            toastMethod(title, {
                description: message,
                duration: 6000,
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
                        reg.showNotification(title, notifOptions)
                    })
                } else {
                    try {
                        const browserNotif = new window.Notification(title, notifOptions)
                        browserNotif.onclick = () => {
                            window.focus()
                            browserNotif.close()
                        }
                    } catch {
                        // iOS no soporta new Notification() en PWA
                    }
                }
            }

            // Sonido
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => { })
        }

        // Real-time (funciona en escritorio y Android)
        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const n = payload.new as { title: string; message: string; type: string }
                    showAlert(n.title, n.message, n.type)
                    lastCheckedAt = new Date().toISOString()
                }
            )
            .subscribe()

        // Polling cada 15s (respaldo para iOS)
        const pollInterval = setInterval(async () => {
            try {
                const { data } = await supabase
                    .from('notifications')
                    .select('id, title, message, type, created_at')
                    .eq('user_id', userId)
                    .gt('created_at', lastCheckedAt)
                    .order('created_at', { ascending: false })

                if (data && data.length > 0) {
                    data.forEach(n => showAlert(n.title, n.message, n.type))
                    lastCheckedAt = new Date().toISOString()
                }
            } catch {
                // Silenciar errores de red
            }
        }, 15000) // Cada 15 segundos

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [userId])

    // Este componente no renderiza nada visible
    return null
}
