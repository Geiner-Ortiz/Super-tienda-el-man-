'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LockClosedIcon, CreditCardIcon } from '@/components/public/icons'
import Link from 'next/link'
import { useSubscription } from '@/shared/hooks/useSubscription'
import { usePathname } from 'next/navigation'

export function TrialLockOverlay() {
    const { isExpired, isLoading } = useSubscription()
    const pathname = usePathname()

    if (isLoading || !isExpired || pathname === '/subscription') return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 lg:pl-64"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="max-w-md w-full"
                >
                    <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
                        {/* Background Decorative */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl rotate-6 flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <LockClosedIcon className="w-10 h-10 text-primary-600" />
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-none">
                                ¡Prueba Gratuita <span className="text-primary-600">Finalizada</span>!
                            </h2>

                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                                Tu periodo de prueba ha terminado. Tus datos están a salvo, pero necesitas un plan activo para seguir gestionando tu tienda.
                            </p>

                            <div className="space-y-4">
                                <Link href="/subscription" className="block">
                                    <Button className="w-full py-6 text-lg font-black bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl shadow-primary-500/20 gap-3">
                                        <CreditCardIcon className="w-6 h-6" />
                                        Ver Planes de Suscripción
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    Desbloquea todas las funciones al instante
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function LockClosedIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )
}
