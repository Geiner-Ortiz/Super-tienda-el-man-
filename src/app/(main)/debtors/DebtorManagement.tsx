import React, { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { debtorService, Debtor, Debt } from '@/features/finances/services/debtorService'
import { useAdminStore } from '@/features/admin/store/adminStore'
import { HistoryView } from './HistoryView'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Check, X, MessageCircle } from 'lucide-react'

interface DebtorManagementProps {
    initialDebtors: Debtor[]
}

export function DebtorManagement({ initialDebtors }: DebtorManagementProps) {
    const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors)
    const { isSupportMode, impersonatedUser } = useAdminStore()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
    const [isAddingDebtor, setIsAddingDebtor] = useState(false)
    const [saving, setSaving] = useState(false)
    const [expandedDebtorId, setExpandedDebtorId] = useState<string | null>(null)

    // Form state for new debtor
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [newAmount, setNewAmount] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

    // Form state for new debt entry
    const [addingDebtToId, setAddingDebtToId] = useState<string | null>(null)
    const [debtAmount, setDebtAmount] = useState('')
    const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0])
    const [debtDesc, setDebtDesc] = useState('')

    // Editing debt entry
    const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState('')
    const [editDate, setEditDate] = useState('')
    const [editDesc, setEditDesc] = useState('')

    const filteredDebtors = useMemo(() => {
        return debtors.map(debtor => {
            const activeDebts = (debtor.debts || []).filter(d => !d.is_paid)
            const totalPending = activeDebts.reduce((acc, d) => acc + Number(d.amount), 0)
            const isFullyPaid = debtor.debts && debtor.debts.length > 0 && activeDebts.length === 0
            return { ...debtor, totalPending, isFullyPaid }
        }).filter(debtor => {
            const matchesSearch = debtor.name.toLowerCase().includes(search.toLowerCase()) || debtor.phone.includes(search)
            if (filter === 'pending') return matchesSearch && !debtor.isFullyPaid
            if (filter === 'paid') return matchesSearch && debtor.isFullyPaid
            return matchesSearch
        })
    }, [debtors, search, filter])

    const { profile } = useAuth()
    const storeName = profile?.store_name || 'nuestra tienda'

    const handleNotify = (debtor: Debtor, amount: number) => {
        const message = `Hola ${debtor.name}, te recordamos que tienes un saldo pendiente en ${storeName} por un valor de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount)}.`
        const whatsappUrl = `https://wa.me/57${debtor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleSaveDebtor = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName || !newPhone || !newAmount) return

        setSaving(true)
        try {
            const amountNum = parseFloat(newAmount)
            // 1. Create Debtor
            const newDebtor = await debtorService.createDebtor({
                name: newName,
                phone: newPhone,
                amount: amountNum // Still keep for compatibility
            })

            // 2. Create Initial Debt
            const initialDebt = await debtorService.addDebt({
                debtor_id: newDebtor.id,
                amount: amountNum,
                debt_date: newDate,
                description: newDescription || 'Deuda inicial',
                is_paid: false
            })

            setDebtors([{ ...newDebtor, debts: [initialDebt] }, ...debtors])
            handleNotify(newDebtor, amountNum)

            // Reset
            setNewName('')
            setNewPhone('')
            setNewAmount('')
            setNewDescription('')
            setIsAddingDebtor(false)
            toast.success('Deudor registrado y notificado correctamente 📱')
        } catch (error) {
            toast.error('Error al guardar el deudor')
        } finally {
            setSaving(false)
        }
    }

    const handleAddDebt = async (debtorId: string) => {
        if (!debtAmount || !debtDate) return
        setSaving(true)
        try {
            const amountNum = parseFloat(debtAmount)
            const newDebt = await debtorService.addDebt({
                debtor_id: debtorId,
                amount: amountNum,
                debt_date: debtDate,
                description: debtDesc,
                is_paid: false
            })

            setDebtors(debtors.map(d =>
                d.id === debtorId ? { ...d, debts: [newDebt, ...(d.debts || [])] } : d
            ))

            setAddingDebtToId(null)
            setDebtAmount('')
            setDebtDesc('')
            toast.success('Nueva deuda agregada 💰')
        } catch (error) {
            toast.error('Error al agregar deuda')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateDebt = async (debtId: string, debtorId: string) => {
        try {
            const updates = {
                amount: parseFloat(editAmount),
                debt_date: editDate,
                description: editDesc
            }
            await debtorService.updateDebt(debtId, updates)
            setDebtors(debtors.map(d =>
                d.id === debtorId
                    ? { ...d, debts: d.debts?.map(dt => dt.id === debtId ? { ...dt, ...updates } : dt) }
                    : d
            ))
            setEditingDebtId(null)
            toast.success('Deuda actualizada')
        } catch (error) {
            toast.error('Error al actualizar')
        }
    }

    const handleToggleDebtPaid = async (debt: Debt, debtorId: string) => {
        try {
            const newStatus = !debt.is_paid
            await debtorService.updateDebt(debt.id, { is_paid: newStatus })
            setDebtors(debtors.map(d =>
                d.id === debtorId
                    ? { ...d, debts: d.debts?.map(dt => dt.id === debt.id ? { ...dt, is_paid: newStatus } : dt) }
                    : d
            ))
        } catch (error) {
            toast.error('Error al cambiar estado')
        }
    }

    const handleDeleteDebt = async (debtId: string, debtorId: string) => {
        if (!confirm('¿Eliminar esta deuda?')) return
        try {
            await debtorService.deleteDebt(debtId)
            setDebtors(debtors.map(d =>
                d.id === debtorId
                    ? { ...d, debts: d.debts?.filter(dt => dt.id !== debtId) }
                    : d
            ))
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    const handleDeleteDebtor = async (id: string) => {
        if (!confirm('¿Eliminar deudor y todas sus deudas?')) return
        try {
            await debtorService.deleteDebtor(id)
            setDebtors(debtors.filter(d => d.id !== id))
            toast.success('Registro eliminado')
        } catch (error) {
            toast.error('Error al eliminar')
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
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 h-14 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddingDebtor(!isAddingDebtor)}
                        className="w-full lg:w-auto rounded-xl bg-primary-600 hover:bg-primary-700 font-bold h-14 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        {isAddingDebtor ? 'Cancelar' : (
                            <>
                                <Plus className="w-5 h-5 mr-2" />
                                <span>Agregar Nuevo Deudor</span>
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
            {isAddingDebtor && (
                <div className="p-6 bg-primary-50/50 dark:bg-primary-900/10 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-200">
                    <form onSubmit={handleSaveDebtor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre</label>
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
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Monto inicial</label>
                            <Input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fecha</label>
                            <Input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descripción Inicial</label>
                            <Input
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Ej: Compra de arroz y aceite"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold h-12 rounded-xl"
                            >
                                {saving ? 'Guardando...' : 'Crear Deudor y Primera Deuda'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="w-10 px-4"></th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Cliente</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Deuda Pendiente</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Estado</th>
                            <th className="text-right px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredDebtors.map((debtor) => (
                            <React.Fragment key={debtor.id}>
                                <tr
                                    className={`group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors ${debtor.isFullyPaid ? 'opacity-60' : ''}`}
                                    onClick={() => setExpandedDebtorId(expandedDebtorId === debtor.id ? null : debtor.id)}
                                >
                                    <td className="px-4 py-4 text-center">
                                        {expandedDebtorId === debtor.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${debtor.isFullyPaid ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'}`}>
                                                {debtor.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${debtor.isFullyPaid ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{debtor.name}</p>
                                                <p className="text-[10px] text-gray-400">{debtor.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 font-black ${debtor.isFullyPaid ? 'text-gray-400' : 'text-red-500'}`}>
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(debtor.totalPending)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${debtor.isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {debtor.isFullyPaid ? 'Saldado' : 'Con Pendientes'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                            {!debtor.isFullyPaid && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleNotify(debtor, debtor.totalPending)}
                                                    className="rounded-xl text-blue-500 hover:bg-blue-50"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Aviso
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteDebtor(debtor.id)}
                                                className="rounded-xl text-red-400 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expanded Content Desktop */}
                                {expandedDebtorId === debtor.id && (
                                    <tr className="bg-gray-50/50 dark:bg-gray-900/40">
                                        <td colSpan={5} className="px-6 py-4 border-l-4 border-primary-500">
                                            <HistoryView
                                                debtor={debtor}
                                                addingDebtToId={addingDebtToId}
                                                setAddingDebtToId={setAddingDebtToId}
                                                handleDeleteDebt={handleDeleteDebt}
                                                handleToggleDebtPaid={handleToggleDebtPaid}
                                                editingDebtId={editingDebtId}
                                                setEditingDebtId={setEditingDebtId}
                                                editAmount={editAmount}
                                                setEditAmount={setEditAmount}
                                                editDate={editDate}
                                                setEditDate={setEditDate}
                                                editDesc={editDesc}
                                                setEditDesc={setEditDesc}
                                                handleUpdateDebt={handleUpdateDebt}
                                                debtAmount={debtAmount}
                                                setDebtAmount={setDebtAmount}
                                                debtDate={debtDate}
                                                setDebtDate={setDebtDate}
                                                debtDesc={debtDesc}
                                                setDebtDesc={setDebtDesc}
                                                handleAddDebt={handleAddDebt}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDebtors.map((debtor) => (
                    <div key={debtor.id} className="p-4 space-y-3">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedDebtorId(expandedDebtorId === debtor.id ? null : debtor.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${debtor.isFullyPaid ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'}`}>
                                    {debtor.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className={`font-bold truncate ${debtor.isFullyPaid ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{debtor.name}</p>
                                    <p className="text-[10px] text-gray-400">{debtor.phone}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
                                <p className={`font-black text-lg ${debtor.isFullyPaid ? 'text-gray-400' : 'text-red-500'}`}>
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(debtor.totalPending)}
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${debtor.isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {debtor.isFullyPaid ? 'Saldado' : 'Pendiente'}
                                </span>
                            </div>
                            <div className="pl-2">
                                {expandedDebtorId === debtor.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                            </div>
                        </div>

                        {/* Quick Mobile Actions */}
                        {!debtor.isFullyPaid && !expandedDebtorId && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNotify(debtor, debtor.totalPending)}
                                    className="flex-1 rounded-xl text-blue-500 border-blue-100 h-10 font-bold text-xs"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Enviar Cobro
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDebtor(debtor.id)}
                                    className="rounded-xl text-red-400 h-10 w-10"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </Button>
                            </div>
                        )}

                        {/* Expanded Content Mobile */}
                        {expandedDebtorId === debtor.id && (
                            <div className="pt-2 animate-in slide-in-from-top duration-200">
                                <HistoryView
                                    debtor={debtor}
                                    addingDebtToId={addingDebtToId}
                                    setAddingDebtToId={setAddingDebtToId}
                                    handleDeleteDebt={handleDeleteDebt}
                                    handleToggleDebtPaid={handleToggleDebtPaid}
                                    editingDebtId={editingDebtId}
                                    setEditingDebtId={setEditingDebtId}
                                    editAmount={editAmount}
                                    setEditAmount={setEditAmount}
                                    editDate={editDate}
                                    setEditDate={setEditDate}
                                    editDesc={editDesc}
                                    setEditDesc={setEditDesc}
                                    handleUpdateDebt={handleUpdateDebt}
                                    debtAmount={debtAmount}
                                    setDebtAmount={setDebtAmount}
                                    debtDate={debtDate}
                                    setDebtDate={setDebtDate}
                                    debtDesc={debtDesc}
                                    setDebtDesc={setDebtDesc}
                                    handleAddDebt={handleAddDebt}
                                    isMobile
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDebtor(debtor.id)}
                                    className="w-full mt-6 text-red-400 text-xs border border-red-50 py-4 h-auto"
                                >
                                    Eliminar Cliente por completo
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    )
}
