'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function SubscriptionBanner() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setUser(profile)
            }
        }
        fetchUser()
    }, [])

    const handleCheckout = () => {
        // Redirigir al checkout de Polar
        window.location.href = '/api/polar/checkout'
    }

    if (user?.subscription_status === 'active') {
        return (
            <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Tu Suscripción es Activa</h3>
                        <p className="text-green-50 opacity-90">Gracias por confiar en Tu Súper Tienda. Tienes acceso a todas las funciones Pro.</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 17.52c-1.48 0-2-1.48-2-2s.52-2 2-2 2 1.41 2 2-.52 2-2 2zm-1.75-7c-.6-.4-1-1-1-1.75 0-1.25 1-2.25 2.25-2.25s2.25 1 2.25 2.25c0 .75-.4 1.35-1 1.75V15h-2.5v-2.48z" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">
                        Plan Premium <span className="text-primary-100 italic">Tu Súper Tienda</span>
                    </h3>
                    <p className="text-primary-50 font-medium max-w-xl">
                        Desbloquea reportes detallados, gestión de inventario Pro y soporte prioritario para llevar tu negocio al siguiente nivel.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                    <div className="text-right">
                        <span className="text-sm font-bold text-primary-100 uppercase tracking-widest line-through">$49.99</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">$14.90</span>
                            <span className="text-sm font-bold text-primary-50">/mes</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        className="w-full md:w-auto px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-bold rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Suscribirme Ahora
                    </Button>
                    <p className="text-[10px] font-bold text-primary-100 uppercase tracking-widest">Pago seguro vía Polar.sh</p>
                </div>
            </div>
        </Card>
    )
}
