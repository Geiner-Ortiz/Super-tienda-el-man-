'use client';

import { useState } from 'react';
import { expenseService } from '../services/expenseService';
import { ExpenseCategory, ExpenseType } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface Props {
    onExpenseAdded: () => void;
}

export function ExpenseForm({ onExpenseAdded }: Props) {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<ExpenseCategory>('fijo');
    const [type, setType] = useState<ExpenseType>('alquiler');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await expenseService.createExpense({
                category,
                type,
                amount: Number(amount),
                expense_date: date,
                description
            });
            setAmount('');
            setDescription('');
            onExpenseAdded();
        } catch (error) {
            console.error('Error saving expense:', error);
        } finally {
            setLoading(false);
        }
    };

    const fixedTypes: ExpenseType[] = ['alquiler', 'comida', 'nomina', 'deudas', 'otros'];
    const varTypes: ExpenseType[] = ['luz', 'gas', 'agua', 'internet', 'otros'];

    return (
        <Card className="p-6 border-none shadow-sm dark:bg-gray-900 space-y-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Registrar Gasto</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <button
                        type="button"
                        onClick={() => { setCategory('fijo'); setType('alquiler'); }}
                        className={`flex-1 py-3 text-base font-bold rounded-lg transition-all ${category === 'fijo' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
                    >
                        Fijos
                    </button>
                    <button
                        type="button"
                        onClick={() => { setCategory('variable'); setType('luz'); }}
                        className={`flex-1 py-3 text-base font-bold rounded-lg transition-all ${category === 'variable' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
                    >
                        Variables
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                        {category === 'variable' ? (
                            <span className="flex items-center gap-1"><Settings className="w-4 h-4" /> Servicios</span>
                        ) : 'Tipo de Gasto'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(category === 'fijo' ? fixedTypes : varTypes).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-4 py-3 text-sm font-bold rounded-xl border transition-all truncate capitalize ${type === t ? 'bg-primary-50 border-primary-200 text-primary-700 ring-1 ring-primary-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <Input
                    label="Monto ($)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                />

                <Input
                    label="Fecha de Pago"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <Input
                    label="Descripción (Opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Pago mes de Marzo"
                />

                <Button type="submit" className="w-full" isLoading={loading}>
                    Guardar Gasto
                </Button>
            </form>
        </Card>
    );
}
