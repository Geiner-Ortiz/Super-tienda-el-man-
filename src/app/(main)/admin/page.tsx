'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { adminService } from '@/features/admin/services/adminService'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/features/admin/store/adminStore'
import { UsersIcon, CalculatorIcon } from '@/components/public/icons'

interface ClientProfile {
    id: string
    full_name: string | null
    email: string
    store_name: string | null
    created_at: string
    role: string
}

interface ClientStats {
    totalSales: number
    totalProfit: number
    totalExpenses: number
    totalDebt: number
    netIncome: number
    debtorCount: number
}

export default function AdminDashboard() {
    const [clients, setClients] = useState<ClientProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
    const [clientStats, setClientStats] = useState<ClientStats | null>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { startSupportMode } = useAdminStore()
    const router = useRouter()

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || profile.role !== 'super_admin') {
                setIsAuthorized(false)
                router.push('/dashboard')
                return
            }

            setIsAuthorized(true)

            // Obtener perfiles que no sean super_admin
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .neq('role', 'super_admin')
                .order('created_at', { ascending: false })

            if (!error && data) {
                setClients(data)
            }
            setIsLoading(false)
        }

        checkAuthAndFetch()
    }, [router])

    const filteredClients = clients.filter(client => {
        const query = searchQuery.toLowerCase()
        return (
            client.id.toLowerCase().includes(query) ||
            (client.full_name || '').toLowerCase().includes(query) ||
            (client.store_name || '').toLowerCase().includes(query) ||
            (client.email || '').toLowerCase().includes(query)
        )
    })

    const handleViewDetails = async (client: ClientProfile) => {
        setSelectedClient(client)
        setIsLoadingStats(true)
        setClientStats(null)
        try {
            const stats = await adminService.getClientFinancials(client.id)
            setClientStats(stats)
        } catch (error) {
            console.error('Error al cargar stats:', error)
        } finally {
            setIsLoadingStats(false)
        }
    }

    if (isAuthorized === false) return null
    if (isLoading && isAuthorized === null) return <div className="p-8 text-center">Verificando credenciales de Maestro...</div>

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Maestro de Control v2</h1>
                <p className="text-gray-500 mt-2">Gestiona todos los clientes y monitorea el crecimiento de la plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Usuarios</p>
                    <p className="text-4xl font-bold text-indigo-900 dark:text-white mt-1">{clients.length}</p>
                </Card>
            </div>

            <Card className="overflow-hidden border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="font-bold text-lg">Directorio de Clientes</h2>
                    <div className="relative flex-1 max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre, tienda o email..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left px-6 py-4 font-semibold text-gray-500">ID Cliente</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-500">Nombre / Tienda</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-500">Email</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-500">Registro</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Cargando directorio...</td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "No hay clientes registrados todavía."}
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group/id">
                                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                                                    {client.id.slice(0, 8)}...
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(client.id)
                                                        alert('ID copiado al portapapeles')
                                                    }}
                                                    className="opacity-0 group-hover/id:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all text-gray-400 hover:text-indigo-600"
                                                    title="Copiar ID completo"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{client.full_name || 'Sin nombre'}</p>
                                                    <p className="text-xs text-indigo-600 font-medium">{client.store_name || 'Tienda no configurada'}</p>
                                                </div>
                                                {isSupportMode && impersonatedUser?.id === client.id && (
                                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-full animate-pulse">
                                                        SOPORTANDO
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {client.email || 'Sin correo'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-lg h-8 w-8 p-0 text-gray-400 hover:text-indigo-600"
                                                    title="Acceso Rápido: Deudores"
                                                    onClick={() => {
                                                        startSupportMode({
                                                            id: client.id,
                                                            storeName: client.store_name || 'Tienda',
                                                            fullName: client.full_name || 'Sin nombre'
                                                        })
                                                        router.push('/debtors')
                                                    }}
                                                >
                                                    <UsersIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-lg h-8 w-8 p-0 text-gray-400 hover:text-green-600"
                                                    title="Acceso Rápido: Contabilidad"
                                                    onClick={() => {
                                                        startSupportMode({
                                                            id: client.id,
                                                            storeName: client.store_name || 'Tienda',
                                                            fullName: client.full_name || 'Sin nombre'
                                                        })
                                                        router.push('/finances')
                                                    }}
                                                >
                                                    <CalculatorIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg py-1 px-3 h-8 text-xs"
                                                    onClick={() => handleViewDetails(client)}
                                                >
                                                    Revisar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Side Panel para Detalles del Cliente */}
            {selectedClient && (
                <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-gray-950 shadow-2xl z-[60] border-l border-border animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col h-full">
                        {/* Header Panel */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="font-bold text-xl text-foreground">Detalle del Negocio</h3>
                                <p className="text-xs text-foreground-muted font-mono mt-1">{selectedClient.id}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0"
                                onClick={() => setSelectedClient(null)}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        </div>

                        {/* Content Panel */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Perfil */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-black text-2xl text-foreground">{selectedClient.store_name || 'Nombre no definido'}</h4>
                                    <p className="text-foreground-secondary font-medium tracking-wide">Dueño: {selectedClient.full_name || 'Sin nombre'}</p>
                                    <p className="text-sm text-foreground-muted">{selectedClient.email}</p>
                                </div>
                            </div>

                            {isLoadingStats ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                                </div>
                            ) : clientStats ? (
                                <div className="space-y-6">
                                    <h5 className="font-bold text-sm uppercase tracking-widest text-foreground-muted">Desempeño Financiero</h5>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Ventas Totales</p>
                                            <p className="text-2xl font-black text-green-700 dark:text-green-400">
                                                ${clientStats.totalSales.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Ganancia Bruta</p>
                                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                                                ${clientStats.totalProfit.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Gastos</p>
                                            <p className="text-2xl font-black text-orange-700 dark:text-orange-400">
                                                ${clientStats.totalExpenses.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mb-1 text-opacity-80">Utilidad Neta</p>
                                            <p className="text-2xl font-black text-white">
                                                ${clientStats.netIncome.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="font-bold text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                Situación de Deuda
                                            </h5>
                                            <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full">
                                                {clientStats.debtorCount} CLI
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-purple-600/60 dark:text-purple-400/60 font-medium">Monto Total en Calle</p>
                                                <p className="text-3xl font-black text-purple-700 dark:text-purple-300">
                                                    ${clientStats.totalDebt.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-purple-500 font-bold italic">Riesgo de Cobro</p>
                                                <div className="h-2 w-24 bg-purple-200 dark:bg-purple-800 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-purple-600" style={{ width: '45%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-foreground-muted italic">No se pudieron cargar las estadísticas.</p>
                            )}
                        </div>

                        {/* Footer Panel */}
                        <div className="p-6 border-t border-border bg-gray-50 dark:bg-gray-900/50 space-y-3">
                            <Button
                                className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => {
                                    startSupportMode({
                                        id: selectedClient.id,
                                        storeName: selectedClient.store_name || 'Tienda',
                                        fullName: selectedClient.full_name || 'Sin nombre'
                                    })
                                    router.push('/dashboard')
                                }}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ingresar al Dashboard
                            </Button>
                            <Button className="w-full h-12 rounded-xl font-bold" variant="outline" onClick={() => setSelectedClient(null)}>
                                Cerrar Revisión
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop al abrir el panel */}
            {selectedClient && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setSelectedClient(null)}
                />
            )}
        </div>
    )
}
