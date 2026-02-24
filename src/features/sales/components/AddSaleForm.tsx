'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { salesService } from '../services/salesService';
import { dashboardService } from '../../dashboard/services/dashboardService';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle, X, Loader2, DollarSign, Smartphone, ArrowRightLeft, Calendar, Settings } from 'lucide-react';

export function AddSaleForm() {
    const [nequiScans, setNequiScans] = useState<{ amount: number, reference: string, url: string }[]>([]);
    const [nequiAmount, setNequiAmount] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [othersAmount, setOthersAmount] = useState('');
    const [cashEntries, setCashEntries] = useState<{ amount: number, note: string }[]>([]);
    const [othersEntries, setOthersEntries] = useState<{ amount: number, note: string }[]>([]);
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'nequi'>('nequi');
    const [reference, setReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { setFinancialData } = useDashboardStore();
    const { profile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // PERSISTENCIA: Cargar del día
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const today = new Date().toLocaleDateString('en-CA');
        const storedDate = localStorage.getItem('nequi_sales_date');

        if (storedDate === today) {
            const savedNequiScans = localStorage.getItem('nequi_sales_history');
            const savedNequiAmount = localStorage.getItem('nequi_sales_amount');
            const savedRef = localStorage.getItem('nequi_sales_refs');
            const savedCashEntries = localStorage.getItem('cash_sales_entries');
            const savedOthersEntries = localStorage.getItem('others_sales_entries');
            const savedCashInput = localStorage.getItem('cash_active_input');
            const savedOthersInput = localStorage.getItem('others_active_input');

            if (savedNequiScans) setNequiScans(JSON.parse(savedNequiScans));
            if (savedNequiAmount) setNequiAmount(savedNequiAmount);
            if (savedRef) setReference(savedRef);
            if (savedCashEntries) setCashEntries(JSON.parse(savedCashEntries));
            if (savedOthersEntries) setOthersEntries(JSON.parse(savedOthersEntries));
            if (savedCashInput) setCashAmount(savedCashInput);
            if (savedOthersInput) setOthersAmount(savedOthersInput);
        } else {
            // Nuevo día: borrar y ACTUALIZAR FECHA
            localStorage.setItem('nequi_sales_date', today);
            localStorage.removeItem('nequi_sales_history');
            localStorage.removeItem('nequi_sales_refs');
            localStorage.removeItem('cash_sales_entries');
            localStorage.removeItem('others_sales_entries');
            localStorage.removeItem('cash_active_input');
            localStorage.removeItem('others_active_input');
            setDate(today);
        }
        setIsLoaded(true);
    }, []);

    // PERSISTENCIA: Guardar cambios
    useEffect(() => {
        if (!isLoaded) return;

        // Nequi
        if (nequiScans.length > 0) localStorage.setItem('nequi_sales_history', JSON.stringify(nequiScans));
        else localStorage.removeItem('nequi_sales_history');

        if (nequiAmount) localStorage.setItem('nequi_sales_amount', nequiAmount);
        else localStorage.removeItem('nequi_sales_amount');

        if (reference) localStorage.setItem('nequi_sales_refs', reference);
        else localStorage.removeItem('nequi_sales_refs');

        // Cash
        if (cashAmount) localStorage.setItem('cash_active_input', cashAmount);
        else localStorage.removeItem('cash_active_input');

        if (cashEntries.length > 0) localStorage.setItem('cash_sales_entries', JSON.stringify(cashEntries));
        else localStorage.removeItem('cash_sales_entries');

        // Others
        if (othersAmount) localStorage.setItem('others_active_input', othersAmount);
        else localStorage.removeItem('others_active_input');

        if (othersEntries.length > 0) localStorage.setItem('others_sales_entries', JSON.stringify(othersEntries));
        else localStorage.removeItem('others_sales_entries');
    }, [nequiScans, nequiAmount, reference, cashAmount, cashEntries, othersAmount, othersEntries, isLoaded]);

    // Auto-cálculo del TOTAL
    const nequiSum = nequiScans.reduce((acc, curr) => acc + curr.amount, 0);
    const cashSum = cashEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const othersSum = othersEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const totalAmount = nequiSum + (Number(cashAmount) || 0) + cashSum + (Number(othersAmount) || 0) + othersSum;

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

            let publicUrl = '';
            if (!uploadResult.error) {
                const { data } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(fileName);
                publicUrl = data.publicUrl;
            }

            // Manejo de respuesta IA
            if (!aiResponse.ok) {
                const errorText = await aiResponse.text();
                throw new Error(errorText || 'Error al analizar con IA');
            }

            const data = await aiResponse.json();

            if (data.isAuthentic === false) {
                toast.error(`Posible Fraude: ${data.fraudReason}`, { duration: 10000 });
                setReceiptUrl(null);
                setIsScanning(false);
                return;
            }

            // Guardar en el historial de escaneos
            const scannedAmount = Number(data.amount) || 0;
            if (scannedAmount > 0) {
                setNequiScans(prev => [...prev, {
                    amount: scannedAmount,
                    reference: data.reference || 'Sin referencia',
                    url: publicUrl
                }]);
            }

            toast.success(`¡Comprobante guardado! + $${scannedAmount.toLocaleString()} ⚡`);
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

            // 1. Registro de Nequi desde historial
            if (nequiScans.length > 0) {
                nequiScans.forEach(scan => {
                    promises.push(salesService.createSale({
                        amount: scan.amount,
                        sale_date: date,
                        payment_method: 'nequi',
                        payment_reference: scan.reference,
                        receipt_url: scan.url || undefined
                    }));
                });
            }

            // Registro manual de Nequi si existe algo en el input (opcional)
            if (Number(nequiAmount) > 0) {
                promises.push(salesService.createSale({
                    amount: Number(nequiAmount),
                    sale_date: date,
                    payment_method: 'nequi',
                    payment_reference: reference || 'Venta manual'
                }));
            }

            // 2. Registro de Efectivo si existe
            const finalCash = (Number(cashAmount) || 0) + cashSum;
            if (finalCash > 0) {
                const notes = cashEntries.map(e => e.note).filter(Boolean).join(', ');
                promises.push(salesService.createSale({
                    amount: finalCash,
                    sale_date: date,
                    payment_method: 'cash',
                    payment_reference: notes || undefined
                }));
            }

            // 3. Registro de Pagos del día si existe
            const finalOthers = (Number(othersAmount) || 0) + othersSum;
            if (finalOthers > 0) {
                const notes = othersEntries.map(e => e.note).filter(Boolean).join(', ');
                promises.push(salesService.createSale({
                    amount: finalOthers,
                    sale_date: date,
                    payment_method: 'others',
                    payment_reference: notes || undefined
                }));
            }

            await Promise.all(promises);
            await refreshDashboard();

            // Reset UI y persistencia
            setNequiAmount('');
            setCashAmount('');
            setOthersAmount('');
            setNequiScans([]);
            setCashEntries([]);
            setOthersEntries([]);
            setReference('');
            setReceiptUrl(null);
            localStorage.removeItem('nequi_sales_amount');
            localStorage.removeItem('nequi_sales_history');
            localStorage.removeItem('nequi_sales_refs');
            localStorage.removeItem('cash_sales_entries');
            localStorage.removeItem('others_sales_entries');
            localStorage.removeItem('cash_active_input');
            localStorage.removeItem('others_active_input');

            toast.success('¡Venta registrada con éxito! 💰');
        } catch (error) {
            toast.error('Error al registrar la transferencia. Por favor intenta de nuevo.');
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
                        <p className="text-[11px] text-primary-100 font-black uppercase tracking-[0.3em] opacity-80">
                            {profile?.store_name || 'Tu Súper Tienda'}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    {!receiptUrl && (
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
                                            Todos los Bancos • Nequi • Daviplata • Galería
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}
                    {/* Historial de Escaneos Nequi */}
                    <AnimatePresence>
                        {nequiScans.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 space-y-4 max-h-60 overflow-y-auto"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">Registros Escaneados</h3>
                                    <span className="text-xs font-black text-white bg-primary-500 px-3 py-1 rounded-full shadow-lg">
                                        Total: ${nequiSum.toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {nequiScans.map((scan, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {scan.url && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/20">
                                                        <img src={scan.url} alt="Recibo" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter truncate">{scan.reference}</p>
                                                    <p className="text-sm font-black text-white">$ {scan.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNequiScans(prev => prev.filter((_, i) => i !== idx));
                                                    toast.info('Comprobante descartado');
                                                }}
                                                className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        <label className="flex items-center justify-between gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Monto Efectivo (Manual)
                            </div>
                            {cashSum > 0 && (
                                <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                    Acumulado: ${cashSum.toLocaleString()}
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">$</span>
                                <input
                                    type="number"
                                    step="any"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    placeholder="0"
                                    className="block w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-2xl font-black"
                                    disabled={isScanning}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const amountToAdd = Number(cashAmount) || 0;
                                    if (amountToAdd > 0) {
                                        const note = prompt('Descripción para este monto (opcional):');
                                        setCashEntries(prev => [...prev, { amount: amountToAdd, note: note || '' }]);
                                        setCashAmount('');
                                        toast.success(`+ $${amountToAdd.toLocaleString()} sumado!`);
                                    } else {
                                        const val = prompt('¿Qué monto deseas sumar al Efectivo?');
                                        if (val && !isNaN(Number(val))) {
                                            const note = prompt('Descripción para este monto (opcional):');
                                            setCashEntries(prev => [...prev, { amount: Number(val), note: note || '' }]);
                                            toast.success(`+ $${Number(val).toLocaleString()} sumado!`);
                                        }
                                    }
                                }}
                                className="w-16 h-[68px] flex items-center justify-center bg-emerald-500 text-white rounded-3xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all outline-none"
                            >
                                <span className="text-3xl font-black">+</span>
                            </button>
                        </div>
                        {/* Historial de Efectivo */}
                        <AnimatePresence>
                            {cashEntries.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-2 mt-2 max-h-32 overflow-y-auto">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Historial del día</p>
                                        {cashEntries.map((entry, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50 group">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-200 truncate">{entry.note || 'Sin nota'}</p>
                                                    <p className="text-[10px] font-bold text-emerald-500">${entry.amount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCashEntries(prev => prev.filter((_, i) => i !== idx));
                                                        toast.info('Entrada eliminada');
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pagos del día (Manual)
                            </div>
                            {othersSum > 0 && (
                                <span className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-500/20">
                                    Acumulado: ${othersSum.toLocaleString()}
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 font-black text-2xl">$</span>
                                <input
                                    type="number"
                                    step="any"
                                    value={othersAmount}
                                    onChange={(e) => setOthersAmount(e.target.value)}
                                    placeholder="0"
                                    className="block w-full pl-12 pr-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-2xl font-black"
                                    disabled={isScanning}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const amountToAdd = Number(othersAmount) || 0;
                                    if (amountToAdd > 0) {
                                        const note = prompt('Descripción para este pago del día (opcional):');
                                        setOthersEntries(prev => [...prev, { amount: amountToAdd, note: note || '' }]);
                                        setOthersAmount('');
                                        toast.success(`+ $${amountToAdd.toLocaleString()} sumado!`);
                                    } else {
                                        const val = prompt('¿Qué monto deseas sumar a Pagos del día?');
                                        if (val && !isNaN(Number(val))) {
                                            const note = prompt('Descripción para este pago (opcional):');
                                            setOthersEntries(prev => [...prev, { amount: Number(val), note: note || '' }]);
                                            toast.success(`+ $${Number(val).toLocaleString()} sumado!`);
                                        }
                                    }
                                }}
                                className="w-16 h-[68px] flex items-center justify-center bg-amber-500 text-white rounded-3xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all outline-none"
                            >
                                <span className="text-3xl font-black">+</span>
                            </button>
                        </div>
                        {/* Historial de Pagos del día */}
                        <AnimatePresence>
                            {othersEntries.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-2 mt-2 max-h-32 overflow-y-auto">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Historial del día</p>
                                        {othersEntries.map((entry, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50 group">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-200 truncate">{entry.note || 'Sin nota'}</p>
                                                    <p className="text-[10px] font-bold text-amber-500">${entry.amount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOthersEntries(prev => prev.filter((_, i) => i !== idx));
                                                        toast.info('Entrada eliminada');
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-[2rem] border-2 border-primary-500/20 shadow-inner flex justify-between items-center group hover:border-primary-500/40 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Venta</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <ArrowRightLeft size={32} />
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

                    <div className="flex flex-col items-center gap-6 mt-4">
                        <div className="relative group">
                            <label className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-white dark:bg-gray-900 text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] z-10 whitespace-nowrap border border-primary-100 dark:border-primary-800 rounded-full">
                                Fecha de Operación
                            </label>
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border-2 border-primary-100 dark:border-primary-800/50 rounded-2xl px-6 py-3 shadow-sm group-hover:border-primary-500 transition-all duration-300">
                                <Calendar size={16} className="text-primary-400 group-hover:animate-bounce" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent border-0 p-0 text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest focus:ring-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] opacity-60">
                            Comprobado por Súper Inteligencia Artificial
                        </p>
                    </div>
                </div>
            </form >
        </div >
    );
}
