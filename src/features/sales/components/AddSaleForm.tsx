'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const { setFinancialData } = useDashboardStore();

    const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsScanning(true);
            const supabase = createClient();

            // 1. Upload to Supabase Storage
            const fileName = `${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);

            setReceiptUrl(publicUrl);

            // 2. Parse with AI
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const response = await fetch('/api/nequi/parse-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64 })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `Error del servidor (${response.status})`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();

                if (data.isAuthentic === false) {
                    toast.error(`Posible Fraude: ${data.fraudReason}`, { duration: 10000 });
                    setIsScanning(false);
                    return;
                }

                if (data.amount) setAmount(data.amount.toString());
                if (data.date) setDate(data.date);
                if (data.reference) setReference(data.reference);

                toast.success('Comprobante validado con éxito');
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            console.error('Error scanning receipt:', error);
            toast.error(`Error de Scanner: ${error.message || 'No se pudo procesar'}`);
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
                payment_reference: reference,
                receipt_url: receiptUrl || undefined
            });
            await refreshDashboard();
            setAmount('');
            setReference('');
            setReceiptUrl(null);
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
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full animate-pulse transition-all">
                        Scanner Nequi Activo
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. SECTOR DE ESCANEO RÁPIDO - AHORA AL PRINCIPIO */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`py-4 px-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${paymentMethod === 'cash'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            <span className="text-xl">💵</span> Efectivo
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('nequi')}
                            className={`py-4 px-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${paymentMethod === 'nequi'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            <span className="text-xl">📲</span> Nequi
                        </button>
                    </div>

                    {paymentMethod === 'nequi' && (
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleScanReceipt}
                                className="hidden"
                                id="receipt-upload"
                                disabled={isScanning}
                            />
                            <label
                                htmlFor="receipt-upload"
                                className={`flex flex-col items-center justify-center gap-2 w-full py-10 border-4 border-dashed rounded-[2.5rem] cursor-pointer transition-all transform active:scale-[0.98] ${isScanning
                                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 animate-pulse'
                                    : 'bg-primary-600 border-primary-400 dark:border-primary-700 hover:bg-primary-700 shadow-xl shadow-primary-500/20'
                                    }`}
                            >
                                <span className="text-4xl mb-2">{isScanning ? '⏳' : '📷'}</span>
                                <span className="text-lg font-black text-white">
                                    {isScanning ? 'Analizando...' : 'ESCANEAR COMPROBANTE'}
                                </span>
                                {!isScanning && <span className="text-primary-100 text-xs font-bold uppercase tracking-widest opacity-80">Toma la foto ahora</span>}
                            </label>
                        </div>
                    )}

                    {reference && paymentMethod === 'nequi' && (
                        <div className="mt-4 px-5 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl text-sm font-bold flex justify-between items-center border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✅</span>
                                <div>
                                    <p className="text-[10px] text-green-600/60 uppercase leading-none mb-1">Referencia</p>
                                    <p className="leading-none">{reference}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-md uppercase font-black">Validado</span>
                        </div>
                    )}
                </div>

                <div className="p-1 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] space-y-4">
                    <div className="p-5 space-y-4">
                        <div>
                            <label htmlFor="sale_date" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                Fecha de la Venta
                            </label>
                            <input
                                type="date"
                                id="sale_date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                disabled={isSubmitting || isScanning}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                Monto de la Venta (COP $)
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl">$</span>
                                <input
                                    type="number"
                                    id="amount"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="block w-full pl-12 pr-6 py-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all text-3xl font-black tracking-tighter"
                                    disabled={isSubmitting || isScanning}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    data-tour="add-sale-button"
                    disabled={isSubmitting || isScanning || !amount}
                    className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-black py-5 px-6 rounded-3xl transition-all shadow-xl shadow-secondary-500/20 disabled:opacity-50 transform active:scale-[0.98] mt-4 text-lg"
                >
                    {isSubmitting ? 'Guardando...' : 'GUARDAR VENTA'}
                </button>
            </form>
        </div>
    );
}
