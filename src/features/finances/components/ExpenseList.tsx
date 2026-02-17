'use client';

import { Expense } from '../types';
import { Card } from '@/components/ui/card';
import { Trash2, AlertCircle } from 'lucide-react';
import { expenseService } from '../services/expenseService';

interface Props {
    expenses: Expense[];
    loading: boolean;
    onDeleted: () => void;
}

export function ExpenseList({ expenses, loading, onDeleted }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        try {
            await expenseService.deleteExpense(id);
            onDeleted();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Sin gastos registrados</h3>
                <p className="text-sm text-gray-400 mt-2">Empieza a registrar tus egresos para verlos aquí</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-none shadow-sm dark:bg-gray-900">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold text-foreground">Historial de Gastos</h3>
                <span className="text-sm font-bold text-primary-500 bg-primary-50 px-3 py-1 rounded-full">{expenses.length} registros</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl font-bold text-xs uppercase ${expense.category === 'fijo' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                {expense.type.substring(0, 3)}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground capitalize">{expense.type}</h4>
                                <p className="text-sm text-foreground-secondary flex items-center gap-2">
                                    {expense.expense_date} • {expense.description || 'Sin descripción'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-red-500">{formatCurrency(expense.amount)}</span>
                            <button
                                onClick={() => handleDelete(expense.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
