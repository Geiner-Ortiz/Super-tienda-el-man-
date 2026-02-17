'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BananaIcon } from '@/components/public/icons'
import Link from 'next/link'

interface GuideStep {
    title: string
    description: string
    icon: React.ReactNode
    color: string
}

const steps: GuideStep[] = [
    {
        title: 'Configura tu Marca',
        description: 'Personaliza tu tienda en segundos. Pon el nombre de tu negocio para que aparezca en el encabezado y define tu margen de ganancia (por defecto 20%). Esto hará que todos tus cálculos sean automáticos y precisos.',
        icon: <CogIcon className="w-6 h-6" />,
        color: 'bg-blue-500'
    },
    {
        title: 'Registra tus Ventas',
        description: 'La base de tu crecimiento. Usa el botón "Nueva Venta" cada vez que un cliente te compre. El sistema restará el costo de inversión y te mostrará tu ganancia neta al instante.',
        icon: <CartIcon className="w-6 h-6" />,
        color: 'bg-green-500'
    },
    {
        title: 'Contabilidad y Gastos',
        description: 'No dejes que el dinero se escape. Registra luz, arriendo, transporte o cualquier gasto hormiga en la sección de Contabilidad. El Dashboard restará estos gastos de tu ganancia bruta para darte tu Capital Real.',
        icon: <CashIcon className="w-6 h-6" />,
        color: 'bg-orange-500'
    },
    {
        title: 'Clientes Morosos (Fiaos)',
        description: 'Lleva el control de quién te debe. Registra el nombre y teléfono del deudor. Puedes enviarles un recordatorio por WhatsApp con solo un clic y marcar como pagado cuando liquiden la deuda.',
        icon: <UsersIcon className="w-6 h-6" />,
        color: 'bg-purple-500'
    },
    {
        title: 'Inteligencia Artificial',
        description: '¿Tienes dudas de cómo va tu negocio? Pregúntale a nuestra IA. Ella analiza tus datos y te da consejos sobre cómo mejorar tus ventas o reducir tus gastos.',
        icon: <HelpCircleIcon className="w-6 h-6" />,
        color: 'bg-indigo-500'
    }
]

export default function UserGuidePage() {
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-yellow-500/30 animate-pulse">
                    <BananaIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Manual del Maestro</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg italic">Domina tu imperio comercial</p>
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold px-2 text-gray-800 dark:text-gray-200">Guía de Inicio Rápido</h2>
                {steps.map((step, index) => (
                    <Card key={index} className="p-6 border-none bg-white dark:bg-gray-900 shadow-lg rounded-3xl overflow-hidden relative group transition-all hover:scale-[1.02]">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${step.color}`} />
                        <div className="flex gap-5">
                            <div className={`w-14 h-14 rounded-2xl ${step.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-inherit/30`}>
                                {step.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">{step.title}</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Questions Section */}
            <div className="space-y-6 pt-4">
                <h2 className="text-xl font-bold px-2 text-gray-800 dark:text-gray-200">Preguntas Frecuentes</h2>

                <div className="space-y-4">
                    <Card className="p-5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl">
                        <h4 className="font-bold mb-2 text-gray-900 dark:text-white">¿Cómo instalo la App?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dale a los 3 puntos de tu navegador y selecciona "Instalar" o "Añadir a pantalla de inicio". Así se verá en pantalla completa sin el navegador.</p>
                    </Card>

                    <Card className="p-5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl">
                        <h4 className="font-bold mb-2 text-gray-900 dark:text-white">¿Mis datos están seguros?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Totalmente. Usamos tecnología de grado bancario para que solo tú puedas ver la información de tu negocio.</p>
                    </Card>

                    <Card className="p-5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl">
                        <h4 className="font-bold mb-2 text-gray-900 dark:text-white">¿Qué pasa si borro algo por error?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ten cuidado, al eliminar un registro este desaparece de inmediato para mantener tu base de datos limpia. Si sucede, regístralo de nuevo lo antes posible.</p>
                    </Card>
                </div>
            </div>

            {/* Tips Section */}
            <Card className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 border-none shadow-xl rounded-[2.5rem] relative overflow-hidden text-white">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                        <span>💡</span> Sabiduría del Maestro
                    </h3>
                    <p className="text-lg leading-relaxed opacity-90 font-medium italic">
                        "Un negocio que no se mide, no crece. Dedica 5 minutos al final de cada jornada para revisar tus números en el Dashboard. Descansarás mejor sabiendo cuánto ganaste hoy."
                    </p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </Card>

            {/* Support Action */}
            <div className="text-center pt-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center w-full h-16 rounded-[2rem] text-xl font-black bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
                >
                    ¡LISTO PARA EL ÉXITO! 🚀
                </Link>
            </div>
        </div>
    )
}

function HelpCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

// Minimal Icons
function CogIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
    )
}

function CartIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )
}

function CashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}
