'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XIcon, BananaIcon } from '@/components/public/icons'

export function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

    useEffect(() => {
        // 1. Detect platform
        const ua = window.navigator.userAgent.toLowerCase()
        const isIOS = /iphone|ipad|ipod/.test(ua)
        const isAndroid = /android/.test(ua)

        // 2. Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true

        // 3. Simple heuristic to show only on mobile and if not installed
        if (!isStandalone && (isIOS || isAndroid)) {
            setPlatform(isIOS ? 'ios' : 'android')

            // Delay to not annoy immediately
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-prompt-dismissed')
                if (!dismissed) {
                    setShowPrompt(true)
                }
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-slide-up lg:hidden">
            <Card className="p-5 shadow-2xl border-primary-100 bg-white/95 backdrop-blur-md relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full opacity-50" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce cursor-default">
                        <BananaIcon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                            ¡Instala la App de "El Maná"!
                        </h4>
                        <p className="text-xs text-gray-500 leading-normal mb-3">
                            Úsala a pantalla completa y sin el navegador para una mejor experiencia.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                ¿Cómo instalar?
                            </p>

                            {platform === 'ios' ? (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>1. Toca</span>
                                    <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0L8 7m4-4l4 4" />
                                        </svg>
                                    </div>
                                    <span>2. Luego</span>
                                    <span className="font-bold">"Añadir a pantalla de inicio"</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>1. Toca</span>
                                    <div className="flex flex-col gap-0.5 items-center">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                    </div>
                                    <span>2. Luego</span>
                                    <span className="font-bold">"Instalar aplicación"</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
