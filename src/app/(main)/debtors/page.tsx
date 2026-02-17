import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { DebtorManagement } from './DebtorManagement'

export const metadata = {
    title: 'Clientes Morosos | Tu Súper Tienda'
}

export default async function DebtorsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Obtener todos los deudores del usuario actual
    const { data: debtors } = await supabase
        .from('debtors')
        .select('*')
        .order('created_at', { ascending: false })

    // Obtener estadísticas (solo deudas no pagadas)
    const stats = {
        totalDebtors: debtors?.filter(d => !d.is_paid).length || 0,
        totalDebt: debtors?.filter(d => !d.is_paid).reduce((acc, d) => acc + Number(d.amount), 0) || 0,
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Clientes Morosos (Fiados)</h1>
                <p className="text-foreground-secondary mt-1">
                    Administra las deudas de tus clientes y envía recordatorios por WhatsApp
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-secondary">Total Clientes Deudores</p>
                        <p className="text-3xl font-bold text-foreground">{stats.totalDebtors}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </Card>
                <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-secondary">Deuda Total Acumulada</p>
                        <p className="text-3xl font-bold text-red-600">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(stats.totalDebt)}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                        <CurrencyIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                </Card>
            </div>

            {/* Debtors Table/Management */}
            <DebtorManagement initialDebtors={debtors || []} />
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}

function CurrencyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
