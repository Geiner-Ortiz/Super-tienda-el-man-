'use client'

import { useServiceWorker } from '@/shared/hooks/useServiceWorker'

export function PWAUpdateBanner() {
    const { isUpdateAvailable, applyUpdate } = useServiceWorker()

    if (!isUpdateAvailable) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-[100] animate-in slide-in-from-bottom duration-500">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl shadow-emerald-900/30 p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">¡Nueva versión disponible!</p>
                    <p className="text-xs text-emerald-100 mt-0.5">Actualiza para obtener las últimas mejoras.</p>
                </div>
                <button
                    onClick={applyUpdate}
                    className="flex-shrink-0 bg-white text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
                >
                    Actualizar
                </button>
            </div>
        </div>
    )
}
