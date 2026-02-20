import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscriptionBanner } from '@/features/payments/components/SubscriptionBanner'

export const metadata = {
    title: 'Suscripción | Tu Súper Tienda'
}

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suscripción</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                    Mejora tu tienda para acceder a nuevas funcionalidades exclusivas.
                </p>
            </div>

            <SubscriptionBanner />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-gray-100 bg-white dark:bg-slate-900 shadow-sm shadow-black/5">
                    <h4 className="font-bold text-lg mb-2">Ventas Al Paso</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Registra ventas al instante de manera rápida y sin complicaciones.</p>
                </div>
                <div className="p-6 rounded-2xl border border-gray-100 bg-white dark:bg-slate-900 shadow-sm shadow-black/5">
                    <h4 className="font-bold text-lg mb-2">Reportes Pro</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visualiza tus ingresos de manera gráfica y analiza tus ganancias al instante.</p>
                </div>
                <div className="p-6 rounded-2xl border border-gray-100 bg-white dark:bg-slate-900 shadow-sm shadow-black/5">
                    <h4 className="font-bold text-lg mb-2">Soporte Prioritario</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Recibe ayuda técnica inmediata de nuestro equipo de expertos.</p>
                </div>
            </div>
        </div>
    )
}
