'use client';

import { useState } from 'react';
import { salesService } from '../services/salesService';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

export function AddSaleForm() {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setStats, setLoading } = useDashboardStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert('Por favor ingresa un monto válido mayor a 0');
            return;
        }

        try {
            setIsSubmitting(true);
            await salesService.createSale({ amount: Number(amount) });
            const updatedSales = await salesService.getSales();
            setStats(updatedSales);
            setAmount('');
        } catch (error) {
            alert('Error al registrar la venta. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Nueva Venta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto de la Venta (COP $)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                        disabled={isSubmitting}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
            </form>
        </div>
    );
}
