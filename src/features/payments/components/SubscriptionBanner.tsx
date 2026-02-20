'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SubscriptionBanner() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()
    }, [])

    const handleCheckout = () => {
        const baseUrl = '/api/polar/checkout'
        const productId = 'c61cd2d8-bdf6-4e8a-bf80-a1674570b86c'
        let checkoutUrl = `${baseUrl}?products=${productId}`

        if (user) {
            checkoutUrl += `&customer_email=${encodeURIComponent(user.email)}`
            checkoutUrl += `&metadata[user_id]=${user.id}`
        }

        window.location.href = checkoutUrl
    }

    return (
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-primary-100 dark:border-primary-900 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white italic mb-2">
                        Plan Profesional <span className="text-primary-600">Tu Súper Tienda</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md font-medium">
                        Desbloquea todas las funciones avanzadas, recordatorios de WhatsApp ilimitados y reportes detallados para tu negocio.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                        <span className="text-sm font-bold text-gray-400 line-through tracking-wider">$49.99</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-primary-600 italic tracking-tighter">$14.90</span>
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/mes</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        className="w-full md:w-auto px-10 py-6 text-lg font-black italic bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        Suscribirme Ahora
                    </Button>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pago seguro vía Polar.sh</p>
                </div>
            </div>
        </Card>
    )
}
