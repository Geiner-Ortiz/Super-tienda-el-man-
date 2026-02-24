'use client';

import { MonthlyClosure } from '../services/accountingService';
import { Card } from '@/components/ui/card';
import { ChevronDown, TrendingUp, TrendingDown, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props {
    history: MonthlyClosure[];
    loading: boolean;
}

export function MonthlyHistoryList({ history, loading }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
                ))}
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                    Aún no tienes cierres de meses anteriores
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 px-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tight">
                    Cierres Mensuales Anteriores
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {history.map((item, index) => (
                    <ClosureCard key={`${item.month}-${item.year}`} item={item} formatCurrency={formatCurrency} />
                ))}
            </div>
        </div>
    );
}

function ClosureCard({ item, formatCurrency }: { item: MonthlyClosure, formatCurrency: (v: number) => string }) {
    const [isOpen, setIsOpen] = useState(false);
    const isPositive = item.netIncome >= 0;

    return (
        <Card className="overflow-hidden border-none shadow-sm dark:bg-gray-900 rounded-3xl group transition-all hover:shadow-md">
            <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPositive ? 'bg-success-50 dark:bg-success-950/30 text-success-600' : 'bg-red-50 dark:bg-red-950/30 text-red-600'}`}>
                        {isPositive ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white capitalize leading-none mb-1">
                            {item.month} {item.year}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Utilidad: <span className={isPositive ? 'text-success-600' : 'text-red-500'}>{formatCurrency(item.netIncome)}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`hidden md:block px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ventas</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(item.totalSales)}</p>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800"
                    >
                        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <DetailItem label="Ventas Totales" value={formatCurrency(item.totalSales)} color="text-primary-600" />
                            <DetailItem label="Gastos Totales" value={formatCurrency(item.totalExpenses)} color="text-red-500" />
                            <DetailItem label="Ganancia Bruta" value={formatCurrency(item.grossProfit)} color="text-amber-600" />
                            <DetailItem label="Utilidad Neta" value={formatCurrency(item.netIncome)} color={isPositive ? 'text-success-600' : 'text-red-600'} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

function DetailItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className={`text-base font-black tracking-tight ${color}`}>{value}</p>
        </div>
    );
}
