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
        description: 'Ve a Configuración para poner el nombre de Tu Negocio y establecer tu margen de ganancia por defecto.',
        icon: <CogIcon className="w-6 h-6" />,
        color: 'bg-blue-500'
    },
    {
        title: 'Registra tus Ventas',
        description: 'En el Dashboard, usa el botón de "Nueva Venta". Ingresa el monto y el sistema calculará tu ganancia automáticamente.',
        icon: <CartIcon className="w-6 h-6" />,
        color: 'bg-green-500'
    },
    {
        title: 'Controla tus Gastos',
        description: 'Registra cada compra o gasto en la sección de Contabilidad. Así sabrás cuánto dinero real queda en tu bolsillo.',
        icon: <CashIcon className="w-6 h-6" />,
        color: 'bg-orange-500'
    },
    {
        title: 'Gestiona Deudores',
        description: 'Si alguien te debe, regístralo en "Clientes Morosos". Podrás ver el total que te deben y marcar cuando te paguen.',
        icon: <UsersIcon className="w-6 h-6" />,
        color: 'bg-purple-500'
    }
]

export default function UserGuidePage() {
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">
                    <BananaIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Manual de Usuario</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium italic">Todo lo que necesitas para tu negocio</p>
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <Card key={index} className="p-5 border-none bg-white dark:bg-gray-900 shadow-md rounded-2xl overflow-hidden relative group transition-all hover:shadow-xl">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${step.color}`} />
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl ${step.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-inherit/20`}>
                                {step.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tips Section */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-none shadow-md rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="text-2xl">💡</span> Tip del Maestro
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    "Recuerda revisar tu Dashboard al final del día. Ver tus ganancias en verde es la mejor motivación para seguir creciendo."
                </p>
            </Card>

            {/* Support Button */}
            <div className="text-center">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center w-full h-14 rounded-2xl text-lg font-bold bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-200"
                >
                    ¡Entendido! Vamos a trabajar
                </Link>
            </div>
        </div>
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
