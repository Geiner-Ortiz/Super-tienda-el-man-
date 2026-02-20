'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XIcon, BananaIcon } from '@/components/public/icons'

import { useUIStore } from '@/shared/store/uiStore'

export function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const { openPWAHelp } = useUIStore()
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

    useEffect(() => {
        // 1. Detect platform
        const ua = window.navigator.userAgent.toLowerCase()
        const isIOS = /iphone|ipad|ipod/.test(ua)
        const isAndroid = /android/.test(ua)

        // 2. Check if already in standalone mode
        const isStandalone = (window.navigator as any).standalone === true ||
            window.matchMedia('(display-mode: standalone)').matches

        // 3. Simple heuristic to show only on mobile and if not installed
        if (!isStandalone && (isIOS || isAndroid)) {
            setPlatform(isIOS ? 'ios' : 'android')

            // Delay to not annoy immediately
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-prompt-dismissed')
                if (!dismissed) {
                    setShowPrompt(true)
                }
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    const openHelp = () => {
        openPWAHelp(platform === 'other' ? 'android' : platform)
        setShowPrompt(false) // Hide small prompt if showing full help
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-slide-up lg:hidden">
            <Card className="p-5 shadow-2xl border-primary-100 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md relative overflow-hidden ring-1 ring-black/5">
                {/* Background Decoration */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-full opacity-50" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce cursor-default">
                        <BananaIcon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight mb-1 italic">
                            ¡Instala Tu Súper Tienda!
                        </h4>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-normal mb-4">
                            Acceso rápido y sin navegador para tu negocio.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                onClick={openHelp}
                                size="sm"
                                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-black text-[10px] uppercase tracking-wider h-9 rounded-xl shadow-lg shadow-primary-500/20"
                            >
                                Ver guía de instalación
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 h-9"
                            >
                                Después
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
