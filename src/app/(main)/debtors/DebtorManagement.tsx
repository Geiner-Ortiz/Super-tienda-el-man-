'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { debtorService, Debtor } from '@/features/finances/services/debtorService'
import { useAdminStore } from '@/features/admin/store/adminStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'


interface DebtorManagementProps {
    initialDebtors: Debtor[]
}

export function DebtorManagement({ initialDebtors }: DebtorManagementProps) {
    const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors)
    const { isSupportMode, impersonatedUser } = useAdminStore()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
    const [isAdding, setIsAdding] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [newAmount, setNewAmount] = useState('')

    const filteredDebtors = debtors.filter(debtor => {
        const matchesSearch = debtor.name.toLowerCase().includes(search.toLowerCase()) || debtor.phone.includes(search)
        if (filter === 'pending') return matchesSearch && !debtor.is_paid
        if (filter === 'paid') return matchesSearch && debtor.is_paid
        return matchesSearch
    })

    const { profile } = useAuth()
    const storeName = profile?.store_name || 'nuestra tienda'

    const handleNotify = (debtor: { name: string; phone: string; amount: number }) => {
        const message = `Hola ${debtor.name}, te recordamos que tienes un saldo pendiente en ${storeName} por un valor de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(debtor.amount)}.`
        const whatsappUrl = `https://wa.me/57${debtor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleTogglePaid = async (debtor: Debtor) => {
        try {
            const newStatus = !debtor.is_paid
            await debtorService.updateDebtor(debtor.id, { is_paid: newStatus })
            setDebtors(debtors.map(d => d.id === debtor.id ? { ...d, is_paid: newStatus } : d))
            toast.success(newStatus ? '¡Deuda marcada como pagada! 🎉' : 'Deuda revertida a pendiente')
        } catch (error: any) {
            console.error("Error updating debtor payment status:", error);
            toast.error(`Error: ${error.message}`);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName || !newPhone || !newAmount) return

        setSaving(true)
        try {
            const amountNum = parseFloat(newAmount)
            const data = await debtorService.createDebtor({
                name: newName,
                phone: newPhone,
                amount: amountNum
            })

            setDebtors([data, ...debtors])
            handleNotify({ name: newName, phone: newPhone, amount: amountNum })

            // Reset form
            setNewName('')
            setNewPhone('')
            setNewAmount('')
            setIsAdding(false)
            toast.success('Deudor registrado y notificado correctamente 📱')
        } catch (error) {
            toast.error('Error al guardar el deudor. Verifica los datos.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return

        try {
            await debtorService.deleteDebtor(id)
            setDebtors(debtors.filter(d => d.id !== id))
            toast.success('Registro eliminado')
        } catch (error) {
            toast.error('Error al eliminar registro')
        }
    }

    return (
        <Card className="overflow-hidden border-gray-100 dark:border-gray-800 rounded-none md:rounded-3xl shadow-sm border-x-0 md:border-x">
            {/* Header / Actions */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full min-w-0">
                        <Input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 h-14 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className="w-full lg:w-auto rounded-xl bg-primary-600 hover:bg-primary-700 font-bold h-14 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        {isAdding ? 'Cancelar' : (
                            <>
                                <span className="hidden xl:inline">Agregar Nuevo Deudor</span>
                                <span className="xl:hidden">Agregar Deudor</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-hide">
                    {(['all', 'pending', 'paid'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filter === t ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
                        >
                            {t === 'all' ? 'Todos' : t === 'pending' ? 'Pendientes' : 'Pagados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Addition Form */}
            {isAdding && (
                <div className="p-6 bg-primary-50/50 dark:bg-primary-900/10 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Alias / Nombre</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej: Doña Maria"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">WhatsApp</label>
                            <Input
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="300 000 0000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Monto</label>
                            <Input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold h-12 rounded-xl"
                            >
                                {saving ? 'Guardando...' : 'Guardar y Notificar'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table wrapper with forced scrollbar visibility */}
            <div className="overflow-x-auto custom-scrollbar pb-10 mx-0 w-full max-w-full touch-pan-x border-b border-gray-100 dark:border-gray-800">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        height: 10px !important;
                        display: block !important;
                        background: rgba(0,0,0,0.05) !important;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: #10B981 !important;
                        border-radius: 20px !important;
                        border: 3px solid white !important;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar {
                        background: rgba(255,255,255,0.05) !important;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        border: 3px solid #0F172A !important;
                    }
                `}} />
                <table className="w-full text-sm min-w-[750px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Cliente</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Deuda</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Estado</th>
                            <th className="text-right px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredDebtors.map((debtor) => (
                            <tr key={debtor.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors ${debtor.is_paid ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${debtor.is_paid ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'}`}>
                                            {debtor.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${debtor.is_paid ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{debtor.name}</p>
                                            <p className="text-[10px] text-gray-400">{debtor.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 font-black ${debtor.is_paid ? 'text-gray-400' : 'text-red-500'}`}>
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(debtor.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${debtor.is_paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {debtor.is_paid ? 'Saldado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <Button
                                        variant={debtor.is_paid ? "ghost" : "outline"}
                                        size="sm"
                                        onClick={() => handleTogglePaid(debtor)}
                                        className={`rounded-xl px-4 ${debtor.is_paid ? 'text-gray-400' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
                                    >
                                        {debtor.is_paid ? 'Revertir' : 'Pagó'}
                                    </Button>
                                    {!debtor.is_paid && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleNotify(debtor)}
                                            className="rounded-xl text-blue-500"
                                        >
                                            Aviso
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(debtor.id)}
                                        className="rounded-xl text-red-400"
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredDebtors.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hay clientes morosos con estos criterios</p>
                    </div>
                )}
            </div>
        </Card>
    )
}
