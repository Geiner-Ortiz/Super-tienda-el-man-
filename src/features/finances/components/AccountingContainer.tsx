'use client';

import { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { Expense } from '../types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { Card } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export function AccountingContainer() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseService.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    const handleExpenseAdded = () => {
        loadExpenses();
    };

    const handleDeleted = () => {
        loadExpenses();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight italic flex items-center gap-4">
                        <Calculator className="w-10 h-10 text-primary-500" />
                        Contabilidad
                    </h1>
                    <p className="mt-2 md:mt-3 text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium">
                        Control de ingresos y egresos de la tienda
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                <div className="lg:col-span-1">
                    <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                </div>
                <div className="lg:col-span-2">
                    <ExpenseList expenses={expenses} loading={loading} onDeleted={handleDeleted} />
                </div>
            </div>
        </div>
    );
}
