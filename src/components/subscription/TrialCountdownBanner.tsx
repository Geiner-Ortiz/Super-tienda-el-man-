'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, InformationCircleIcon } from '@/components/public/icons'
import Link from 'next/link'
import { useSubscription } from '@/shared/hooks/useSubscription'

export function TrialCountdownBanner() {
    const { isTrial, daysRemaining, isLoading } = useSubscription()

    if (isLoading || !isTrial) return null

    // Solo mostrar el banner si quedan 3 días o menos
    const showUrgent = daysRemaining <= 3

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className={`w-full overflow-hidden ${showUrgent
                        ? 'bg-gradient-to-r from-warning-500 to-orange-600'
                        : 'bg-gradient-to-r from-primary-600 to-accent-600'
                    } text-white relative z-[51]`}
            >
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            {showUrgent ? (
                                <InformationCircleIcon className="w-4 h-4" />
                            ) : (
                                <SparklesIcon className="w-4 h-4" />
                            )}
                        </div>
                        <p className="text-xs md:text-sm font-bold tracking-tight">
                            {showUrgent
                                ? `⚠️ ¡Atención! Tu prueba gratuita termina en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}.`
                                : `🚀 Estás en periodo de prueba. Te quedan ${daysRemaining} días de acceso Pro.`
                            }
                        </p>
                    </div>

                    <Link href="/subscription">
                        <button className="text-[10px] md:text-xs font-black uppercase tracking-widest bg-white text-gray-900 px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-black/10">
                            Activar Premium
                        </button>
                    </Link>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
