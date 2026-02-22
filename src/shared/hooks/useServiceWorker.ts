'use client'

import { useEffect, useState, useCallback } from 'react'

interface ServiceWorkerState {
    isUpdateAvailable: boolean
    applyUpdate: () => void
}

export function useServiceWorker(): ServiceWorkerState {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

    const applyUpdate = useCallback(() => {
        if (waitingWorker) {
            waitingWorker.postMessage('SKIP_WAITING')
            // Recargar la página para aplicar la nueva versión
            window.location.reload()
        }
    }, [waitingWorker])

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                })

                // Chequear updates cada 60 segundos
                const checkInterval = setInterval(() => {
                    registration.update()
                }, 60 * 1000)

                // Detectar cuando hay un worker nuevo esperando
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (!newWorker) return

                    newWorker.addEventListener('statechange', () => {
                        if (
                            newWorker.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            // Hay una actualización lista
                            setWaitingWorker(newWorker)
                            setIsUpdateAvailable(true)
                        }
                    })
                })

                // Si ya hay un worker esperando al cargar
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting)
                    setIsUpdateAvailable(true)
                }

                // Recargar cuando el nuevo SW toma control
                let refreshing = false
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true
                        window.location.reload()
                    }
                })

                return () => clearInterval(checkInterval)
            } catch (error) {
                console.error('Error registrando Service Worker:', error)
            }
        }

        registerSW()
    }, [])

    return { isUpdateAvailable, applyUpdate }
}
