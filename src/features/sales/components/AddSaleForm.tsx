'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { salesService } from '../services/salesService';
import { dashboardService } from '../../dashboard/services/dashboardService';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle, X, Loader2, DollarSign, Smartphone } from 'lucide-react';

export function AddSaleForm() {
    const [nequiAmount, setNequiAmount] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'nequi'>('nequi');
    const [reference, setReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const { setFinancialData } = useDashboardStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-cálculo del TOTAL
    const totalAmount = (Number(nequiAmount) || 0) + (Number(cashAmount) || 0);

    // Helper: Comprimir imagen usando Canvas
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Exportar como base64 con calidad reducida (0.7)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsScanning(true);
            const supabase = createClient();

            // 1. Compresión inmediata para velocidad
            const compressedBase64 = await compressImage(file);
            const base64Data = compressedBase64.split(',')[1];

            // 2. Procesamiento en PARALELO (IA + Upload)
            const fileName = `${Date.now()}-${file.name}`;

            const [aiResponse, uploadResult] = await Promise.all([
                // Llamada a IA
                fetch('/api/nequi/parse-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64Data })
                }),
                // Subida a Supabase
                supabase.storage
                    .from('receipts')
                    .upload(fileName, file)
            ]);

            // Manejo de errores de Upload
            if (uploadResult.error) {
                console.error('Upload Error:', uploadResult.error);
                // No detenemos el flujo si la IA respondió bien, pero avisamos
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(fileName);
                setReceiptUrl(publicUrl);
            }

            // Manejo de respuesta IA
            if (!aiResponse.ok) {
                const errorText = await aiResponse.text();
                throw new Error(errorText || 'Error al analizar con IA');
            }

            const data = await aiResponse.json();

            if (data.isAuthentic === false) {
                toast.error(`Posible Fraude: ${data.fraudReason}`, { duration: 10000 });
                // Limpiar si es fraude evidente
                setReceiptUrl(null);
                setIsScanning(false);
                return;
            }

            // Acumular el monto (Suma automática)
            if (data.amount) {
                setNequiAmount(prev => {
                    const current = Number(prev) || 0;
                    return (current + data.amount).toString();
                });
            }
            if (data.date) setDate(data.date);
            if (data.reference) {
                setReference(prev => prev ? `${prev}, ${data.reference}` : data.reference);
            }

            toast.success(`+ $${data.amount.toLocaleString()} sumado con éxito! ⚡`);
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

        if (totalAmount <= 0) {
            toast.error('Por favor ingresa un monto válido mayor a 0');
            return;
        }

        try {
            setIsSubmitting(true);
            const promises = [];

            // 1. Registro de Nequi si existe
            if (Number(nequiAmount) > 0) {
                promises.push(salesService.createSale({
                    amount: Number(nequiAmount),
                    sale_date: date,
                    payment_method: 'nequi',
                    payment_reference: reference,
                    receipt_url: receiptUrl || undefined
                }));
            }

            // 2. Registro de Efectivo si existe
            if (Number(cashAmount) > 0) {
                promises.push(salesService.createSale({
                    amount: Number(cashAmount),
                    sale_date: date,
                    payment_method: 'cash'
                }));
            }

            await Promise.all(promises);
            await refreshDashboard();

            // Reset
            setNequiAmount('');
            setCashAmount('');
            setReference('');
            setReceiptUrl(null);
            toast.success('¡Venta híbrida registrada con éxito! 💰');
        } catch (error) {
            toast.error('Error al registrar la venta. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-500">
            {/* 1. SECCIÓN SUPERIOR EXTREMA: HEADER Y SCANNER (FOCUS NEQUI) */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white relative">
                <div className="flex flex-col mb-10">
                    <h3 className="text-4xl font-black tracking-tighter leading-none">Nueva Venta</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-pulse" />
                        <p className="text-[11px] text-primary-100 font-black uppercase tracking-[0.3em] opacity-80">Súper Tienda El Maná</p>
                    </div>
                </div>

                <div className="relative">
                    {!receiptUrl ? (
                        <div className="relative overflow-hidden group">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleScanReceipt}
                                className="hidden"
                                id="receipt-upload-v3"
                                disabled={isScanning}
                            />
                            <label
                                htmlFor="receipt-upload-v3"
                                className={`relative flex flex-col items-center justify-center gap-6 w-full py-20 border-4 border-dashed border-white/20 rounded-[3.5rem] cursor-pointer transition-all duration-500 overflow-hidden ${isScanning ? 'bg-white/5 animate-pulse' : 'bg-white/5 hover:bg-white/10 hover:border-white/40 shadow-2xl'
                                    }`}
                            >
                                {/* Efecto de Escaneo Moderno */}
                                {isScanning && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent z-0"
                                        animate={{ top: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="p-6 bg-white text-primary-600 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                        {isScanning ? <Loader2 className="animate-spin" size={48} /> : <Camera size={48} />}
                                    </div>
                                    <div className="text-center">
                                        <span className="text-3xl font-black block uppercase tracking-tighter leading-none">
                                            {isScanning ? 'LEYENDO...' : 'ESCANEAR'}
                                        </span>
                                        <p className="text-primary-200 text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-60">
                                            Cualquier Banco • Galería • Cámara
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-6 bg-white/10 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/20 overflow-hidden border-2 border-white/30 shadow-inner">
                                    <img src={receiptUrl} alt="Recibo" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-2xl border-4 border-primary-700">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Comprobante Listo</p>
                                <p className="text-2xl font-black text-white truncate tracking-tighter">{reference || 'Analizando...'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setReceiptUrl(null); setReference(''); setNequiAmount(''); }}
                                className="w-14 h-14 flex items-center justify-center bg-white/10 text-white rounded-full font-bold hover:bg-white hover:text-primary-700 transition-all duration-300 shadow-lg"
                            >
                                <X size={28} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* 2. FORMULARIO DE DATOS */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gray-50 dark:bg-gray-800/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-primary-500" /> Monto Nequi/Transferencia (Scanner)
                        </label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 font-black text-2xl">$</span>
                            <input
                                type="number"
                                step="any"
                                value={nequiAmount}
                                onChange={(e) => setNequiAmount(e.target.value)}
                                placeholder="0.00"
                                className="block w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-2xl font-black"
                                disabled={isScanning}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Monto Efectivo (Manual)
                        </label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">$</span>
                            <input
                                type="number"
                                step="any"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                placeholder="0.00"
                                className="block w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-2xl font-black"
                                disabled={isScanning}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-[2rem] border-2 border-primary-500/20 shadow-inner flex justify-between items-center group hover:border-primary-500/40 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total de Venta</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <DollarSign size={32} />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || isScanning || totalAmount <= 0}
                        className={`w-full font-black py-6 px-8 rounded-[2rem] transition-all duration-500 transform active:scale-[0.98] text-xl shadow-2xl flex items-center justify-center gap-4 ${isSubmitting || isScanning || totalAmount <= 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                            }`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                        {isSubmitting ? 'GUARDANDO...' : 'FINALIZAR VENTA'}
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent border-0 text-[10px] font-black text-gray-400 uppercase tracking-widest focus:ring-0 cursor-pointer"
                        />
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] opacity-60">
                            Comprobado por Súper Inteligencia Artificial
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
