'use client';

import { useState } from 'react';
import { salesService } from '../services/salesService';
import { dashboardService } from '../../dashboard/services/dashboardService';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { toast } from 'sonner';

export function AddSaleForm() {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'nequi'>('cash');
    const [reference, setReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const { setFinancialData, setLoading } = useDashboardStore();

    const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsScanning(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const response = await fetch('/api/nequi/parse-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64 })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                if (!data.isAuthentic) {
                    toast.error(`⚠️ POSIBLE FRAUDE DETECTADO: ${data.fraudReason}`);
                    return;
                }

                if (data.amount) setAmount(data.amount.toString());
                if (data.reference) setReference(data.reference);
                if (data.date) setDate(data.date);
                setPaymentMethod('nequi');
                toast.success('¡Comprobante escaneado y verificado! ✅');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error scanning:', error);
            toast.error('Error al escanear el comprobante');
        } finally {
            setIsScanning(false);
        }
    };

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
                sale_date: date,
                payment_method: paymentMethod,
                payment_reference: reference
            });
            await refreshDashboard();
            setAmount('');
            setReference('');
            setPaymentMethod('cash');
            toast.success('¡Venta registrada con éxito! 💰');
        } catch (error) {
            toast.error('Error al registrar la venta. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Venta</h3>
                {paymentMethod === 'nequi' && (
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full animate-pulse">
                        Sincronizado con Nequi
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-3 px-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMethod === 'cash'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                            : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                            }`}
                    >
                        💵 Efectivo
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('nequi')}
                        className={`py-3 px-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMethod === 'nequi'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                            : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                            }`}
                    >
                        📲 Nequi
                    </button>
                </div>

                {paymentMethod === 'nequi' && (
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                            Verificación Nequi
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleScanReceipt}
                                className="hidden"
                                id="receipt-upload"
                                disabled={isScanning}
                            />
                            <label
                                htmlFor="receipt-upload"
                                className={`flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isScanning
                                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200'
                                    : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800 hover:border-primary-400 hover:bg-primary-50'
                                    }`}
                            >
                                <span className="text-2xl">{isScanning ? '⏳' : '📷'}</span>
                                <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                                    {isScanning ? 'Escaneando con IA...' : 'Escanear Comprobante Nequi'}
                                </span>
                            </label>
                        </div>
                        {reference && (
                            <div className="mt-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-medium flex justify-between items-center">
                                <span>Ref: {reference}</span>
                                <span className="text-[10px] uppercase font-bold tracking-tighter">Verificado</span>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label htmlFor="sale_date" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Fecha de la Venta
                    </label>
                    <input
                        type="date"
                        id="sale_date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                        disabled={isSubmitting || isScanning}
                        required
                    />
                </div>

                <div>
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
                            className="block w-full pl-8 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all text-xl font-bold tracking-tight"
                            disabled={isSubmitting || isScanning}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    data-tour="add-sale-button"
                    disabled={isSubmitting || isScanning}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 transform active:scale-[0.98] mt-4"
                >
                    {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
            </form>
        </div>
    );
}
