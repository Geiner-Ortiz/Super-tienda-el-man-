import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { UserManagement } from './UserManagement'

export const metadata = {
    title: 'Personal | Súper Tienda El Maná'
}

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Obtener todos los usuarios
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    // Obtener estadísticas
    const stats = {
        total: users?.length || 0,
        admins: users?.filter(u => u.role === 'admin').length || 0,
        sellers: users?.filter(u => u.role === 'lawyer').length || 0,
        customers: users?.filter(u => u.role === 'client').length || 0,
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Gestión de Personal</h1>
                <p className="text-foreground-secondary mt-1">
                    Administra el personal y asigna roles en Súper Tienda El Maná
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 shadow-sm border-none bg-white dark:bg-gray-900">
                    <p className="text-sm text-foreground-secondary">Total Personal</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </Card>
                <Card className="p-4 border-l-4 border-blue-500 shadow-sm bg-white dark:bg-gray-900">
                    <p className="text-sm text-foreground-secondary">Administradores</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
                </Card>
                <Card className="p-4 border-l-4 border-emerald-500 shadow-sm bg-white dark:bg-gray-900">
                    <p className="text-sm text-foreground-secondary">Vendedores</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.sellers}</p>
                </Card>
                <Card className="p-4 border-l-4 border-purple-500 shadow-sm bg-white dark:bg-gray-900">
                    <p className="text-sm text-foreground-secondary">Clientes</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.customers}</p>
                </Card>
            </div>

            {/* Users Table */}
            <UserManagement initialUsers={users || []} />
        </div>
    )
}
