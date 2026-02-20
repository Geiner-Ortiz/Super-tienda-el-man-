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
                <h1 className="text-3xl font-bold text-foreground">Suscripción</h1>
                <p className="text-foreground-secondary mt-1 text-lg">
                    Mejora tu cuenta para acceder a funciones exclusivas
                </p>
            </div>

            <SubscriptionBanner />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-border shadow-sm">
                    <h4 className="font-bold text-lg mb-2">WhatsApp Ilimitado</h4>
                    <p className="text-foreground-secondary text-sm">Envía recordatorios automáticos a todos tus clientes sin límites.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-border shadow-sm">
                    <h4 className="font-bold text-lg mb-2">Reportes Pro</h4>
                    <p className="text-foreground-secondary text-sm">Visualiza el crecimiento de tu negocio con gráficas y análisis avanzados.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-border shadow-sm">
                    <h4 className="font-bold text-lg mb-2">Soporte Prioritario</h4>
                    <p className="text-foreground-secondary text-sm">Recibe ayuda técnica inmediata de nuestro equipo de expertos.</p>
                </div>
            </div>
        </div>
    )
}
