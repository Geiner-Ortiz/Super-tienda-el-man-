import React from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Debt, Debtor } from '@/features/finances/services/debtorService'

interface HistoryViewProps {
    debtor: Debtor;
    addingDebtToId: string | null;
    setAddingDebtToId: (id: string | null) => void;
    handleDeleteDebt: (debtId: string, debtorId: string) => void;
    handleToggleDebtPaid: (debt: Debt, debtorId: string) => void;
    editingDebtId: string | null;
    setEditingDebtId: (id: string | null) => void;
    editAmount: string;
    setEditAmount: (val: string) => void;
    editDate: string;
    setEditDate: (val: string) => void;
    editDesc: string;
    setEditDesc: (val: string) => void;
    handleUpdateDebt: (debtId: string, debtorId: string) => void;
    debtAmount: string;
    setDebtAmount: (val: string) => void;
    debtDate: string;
    setDebtDate: (val: string) => void;
    debtDesc: string;
    setDebtDesc: (val: string) => void;
    handleAddDebt: (id: string) => void;
    isMobile?: boolean;
}

export function HistoryView({
    debtor,
    addingDebtToId,
    setAddingDebtToId,
    handleDeleteDebt,
    handleToggleDebtPaid,
    editingDebtId,
    setEditingDebtId,
    editAmount,
    setEditAmount,
    editDate,
    setEditDate,
    editDesc,
    setEditDesc,
    handleUpdateDebt,
    debtAmount,
    setDebtAmount,
    debtDate,
    setDebtDate,
    debtDesc,
    setDebtDesc,
    handleAddDebt,
    isMobile = false
}: HistoryViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Historial de Deudas</h4>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg bg-white dark:bg-gray-800 text-[10px] font-bold"
                    onClick={() => setAddingDebtToId(debtor.id)}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Nueva Deuda
                </Button>
            </div>

            {/* New Debt Entry form */}
            {addingDebtToId === debtor.id && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 animate-in fade-in zoom-in duration-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            placeholder="Monto"
                            value={debtAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebtAmount(e.target.value)}
                            className="h-10 text-sm"
                        />
                        <Input
                            type="date"
                            value={debtDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebtDate(e.target.value)}
                            className="h-10 text-sm"
                        />
                    </div>
                    <Input
                        placeholder="Descripción"
                        value={debtDesc}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebtDesc(e.target.value)}
                        className="h-10 text-sm"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary-600 font-bold" onClick={() => handleAddDebt(debtor.id)}>Guardar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingDebtToId(null)}>Cerrar</Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {(debtor.debts || []).map(debt => (
                    <div key={debt.id} className={`flex items-center justify-between p-3 rounded-xl border ${debt.is_paid ? 'bg-gray-100/30 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'}`}>
                        {editingDebtId === debt.id ? (
                            <div className="flex-1 grid grid-cols-1 gap-2 mr-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input type="number" value={editAmount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditAmount(e.target.value)} className="h-8 text-xs" />
                                    <Input type="date" value={editDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDate(e.target.value)} className="h-8 text-xs" />
                                </div>
                                <Input placeholder="Descripción" value={editDesc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDesc(e.target.value)} className="h-8 text-xs" />
                            </div>
                        ) : (
                            <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm whitespace-nowrap ${debt.is_paid ? 'text-gray-400 line-through' : 'text-red-500'}`}>
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(debt.amount)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                                        {new Date(debt.debt_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {debt.description && <p className="text-[10px] text-gray-500 truncate mt-0.5">{debt.description}</p>}
                            </div>
                        )}

                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            {editingDebtId === debt.id ? (
                                <>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-500 hover:bg-green-50" onClick={() => handleUpdateDebt(debt.id, debtor.id)}><Check className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-300 hover:bg-red-50" onClick={() => setEditingDebtId(null)}><X className="w-4 h-4" /></Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant={debt.is_paid ? "ghost" : "outline"}
                                        className={`h-8 px-2 rounded-lg text-[9px] font-black uppercase tracking-tight ${debt.is_paid ? 'text-gray-400' : 'text-green-600 border-green-100 bg-green-50/50 hover:bg-green-100'}`}
                                        onClick={() => handleToggleDebtPaid(debt, debtor.id)}
                                    >
                                        {debt.is_paid ? 'Volver' : 'Pagó'}
                                    </Button>
                                    {!isMobile && (
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400" onClick={() => {
                                            setEditingDebtId(debt.id)
                                            setEditAmount(debt.amount.toString())
                                            setEditDate(debt.debt_date)
                                            setEditDesc(debt.description || '')
                                        }}><Edit2 className="w-3.5 h-3.5" /></Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-300 hover:text-red-500" onClick={() => handleDeleteDebt(debt.id, debtor.id)}><Trash2 className="w-4.5 h-4.5" /></Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {(!debtor.debts || debtor.debts.length === 0) && (
                    <p className="text-center py-6 text-[10px] text-gray-400 italic">No hay registros detallados</p>
                )}
            </div>
        </div>
    )
}
