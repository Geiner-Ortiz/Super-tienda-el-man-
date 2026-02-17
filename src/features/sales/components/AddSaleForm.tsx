'use client';

import { useState } from 'react';
import { salesService } from '../services/salesService';
import { dashboardService } from '../../dashboard/services/dashboardService';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { toast } from 'sonner';

export function AddSaleForm() {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setFinancialData, setLoading } = useDashboardStore();

    const refreshDashboard = async () => {
        try {
            const [stats, trends, sales] = await Promise.all([
                dashboardService.getFinancialStats(),
                dashboardService.getDailyTrends(),
                salesService.getSales()
            ]);
            setFinancialData(stats, trends, sales);
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error('Por favor ingresa un monto válido mayor a 0');
            return;
        }

        try {
            setIsSubmitting(true);
            await salesService.createSale({
                amount: Number(amount),
                sale_date: date
            });
            await refreshDashboard();
            setAmount('');
            toast.success('¡Venta registrada con éxito! 💰');
        } catch (error) {
            toast.error('Error al registrar la venta. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Nueva Venta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="sale_date" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Fecha de la Venta
                    </label>
                    <input
                        type="date"
                        id="sale_date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium mb-4"
                        disabled={isSubmitting}
                        required
                    />

                    <label htmlFor="amount" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Monto de la Venta (COP $)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                            type="number"
                            id="amount"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="block w-full pl-8 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-xl font-bold tracking-tight"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    data-tour="add-sale-button"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
            </form>
        </div>
    );
}
