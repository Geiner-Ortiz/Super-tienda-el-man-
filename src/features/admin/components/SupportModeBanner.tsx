'use client'

import { useAdminStore } from '@/features/admin/store/adminStore'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function SupportModeBanner() {
    const { isSupportMode, impersonatedUser, stopSupportMode } = useAdminStore()
    const router = useRouter()

    if (!isSupportMode || !impersonatedUser) return null

    const handleExit = () => {
        stopSupportMode()
        router.push('/admin')
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient-x p-2 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                <div className="flex items-center gap-3 text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 animate-pulse">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <p className="font-black text-sm uppercase tracking-tight">Modo Soporte Activo</p>
                        <span className="hidden sm:block opacity-50">|</span>
                        <p className="text-xs font-medium opacity-90">
                            Visualizando a: <span className="underline font-bold text-white">{impersonatedUser.storeName}</span> ({impersonatedUser.fullName})
                        </p>
                    </div>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExit}
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 py-1.5 h-auto rounded-lg shadow-lg border border-white/10"
                >
                    Salir del Espacio
                </Button>
            </div>
            <style jsx>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }
                .animate-gradient-x {
                    background-size: 200% 100%;
                    animation: gradient-x 15s ease infinite;
                }
            `}</style>
        </div>
    )
}
