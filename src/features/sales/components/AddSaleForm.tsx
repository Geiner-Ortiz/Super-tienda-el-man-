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
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'nequi'>('cash');
    const [reference, setReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const { setFinancialData } = useDashboardStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // Auto-llenado instantáneo
            if (data.amount) setAmount(data.amount.toString());
            if (data.date) setDate(data.date);
            if (data.reference) setReference(data.reference);

            toast.success('¡Comprobante procesado en tiempo récord! ⚡');
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
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-500">
            {/* 1. SECCIÓN SUPERIOR EXTREMA: SELECTOR Y SCANNER */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white relative">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black tracking-tight">Nueva Venta</h3>
                    <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 ${paymentMethod === 'cash' ? 'bg-white text-primary-700 shadow-lg' : 'text-primary-100 hover:bg-white/5'}`}
                        >
                            <DollarSign size={16} /> CASH
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('nequi')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 ${paymentMethod === 'nequi' ? 'bg-white text-primary-700 shadow-lg' : 'text-primary-100 hover:bg-white/5'}`}
                        >
                            <Smartphone size={16} /> NEQUI
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {paymentMethod === 'nequi' ? (
                        <motion.div
                            key="nequi-scanner"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative"
                        >
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
                                        className={`relative flex flex-col items-center justify-center gap-4 w-full py-16 border-4 border-dashed border-white/30 rounded-[3rem] cursor-pointer transition-all duration-500 overflow-hidden ${isScanning ? 'bg-white/5 animate-pulse' : 'bg-white/5 hover:bg-white/10 hover:border-white/50'
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

                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className="p-5 bg-white text-primary-600 rounded-[2rem] shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                                                {isScanning ? <Loader2 className="animate-spin" size={40} /> : <Camera size={40} />}
                                            </div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black block uppercase tracking-tight">
                                                    {isScanning ? 'ANALIZANDO...' : 'ESCANEAR RECIBO'}
                                                </span>
                                                <p className="text-primary-100/70 text-xs font-bold uppercase tracking-widest mt-1">Cámara o Galería</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center gap-6 bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/30 shadow-2xl"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-white/20 overflow-hidden border-2 border-white/40 shadow-inner">
                                            <img src={receiptUrl} alt="Recibo" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                            <CheckCircle2 size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white/60 uppercase tracking-widest">Recibo Detectado</p>
                                        <p className="text-xl font-black text-white truncate max-w-[150px]">{reference || 'Procesando...'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setReceiptUrl(null); setReference(''); }}
                                        className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-full font-bold hover:bg-white hover:text-primary-600 transition-all duration-300"
                                    >
                                        <X size={24} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cash-info"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="py-12 text-center"
                        >
                            <div className="inline-flex p-6 bg-white/10 rounded-[2.5rem] border border-white/10 mb-4">
                                <DollarSign size={48} className="text-primary-100" />
                            </div>
                            <p className="text-primary-100 text-lg font-medium">Registro manual de venta en efectivo</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. FORMULARIO DE DATOS */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gray-50 dark:bg-gray-800/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-primary-500" /> Fecha de Venta
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="block w-full px-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg"
                            disabled={isSubmitting || isScanning}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Monto de la Venta
                        </label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-3xl">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="block w-full pl-14 pr-8 py-5 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-4xl font-black tracking-tighter"
                                disabled={isSubmitting || isScanning}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || isScanning || !amount}
                        className={`w-full font-black py-6 px-8 rounded-[2rem] transition-all duration-500 transform active:scale-[0.98] text-xl shadow-2xl flex items-center justify-center gap-4 ${isSubmitting || isScanning || !amount
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                            }`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                        {isSubmitting ? 'GUARDANDO...' : 'FINALIZAR VENTA'}
                    </button>

                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        Comprobado por Súper Inteligencia Artificial
                    </p>
                </div>
            </form>
        </div>
    );
}
