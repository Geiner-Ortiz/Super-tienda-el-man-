'use client';

import { Sale } from '../types';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface SalesListProps {
    sales: Sale[];
}

export function SalesList({ sales }: SalesListProps) {
    const { profile } = useAuth();
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Agrupar ventas por día
    const groupedSales = sales.reduce((acc, sale) => {
        const date = sale.sale_date;
        if (!acc[date]) {
            acc[date] = {
                date,
                totalAmount: 0,
                totalProfit: 0,
                nequiAmount: 0,
                cashAmount: 0,
                ids: []
            };
        }
        acc[date].totalAmount += sale.amount;
        acc[date].totalProfit += sale.profit;
        acc[date].ids.push(sale.id);

        if (sale.payment_method === 'nequi') {
            acc[date].nequiAmount += sale.amount;
        } else {
            acc[date].cashAmount += sale.amount;
        }

        return acc;
    }, {} as Record<string, {
        date: string;
        totalAmount: number;
        totalProfit: number;
        nequiAmount: number;
        cashAmount: number;
        ids: string[];
    }>);

    const sortedDates = Object.keys(groupedSales).sort((a, b) => b.localeCompare(a));

    return (
        <Card className="overflow-hidden border-none shadow-2xl dark:bg-gray-900 rounded-[2.5rem]">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tight">Cierres Diarios</h3>
                <span className="px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black rounded-full uppercase tracking-widest">
                    {sortedDates.length} Días
                </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedDates.map((dateStr) => {
                    const data = groupedSales[dateStr];
                    return (
                        <div key={dateStr} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-inner">
                                    <CurrencyIcon className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        {formatCurrency(data.totalAmount)}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {/* Evitar desfase de zona horaria: añadir la hora local o parsear a mano */}
                                        {new Date(data.date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>

                                    {/* Desglose de Pago */}
                                    <div className="flex items-center gap-3 mt-2">
                                        {data.nequiAmount > 0 && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-black rounded-lg border border-primary-100 dark:border-primary-800/50">
                                                📲 NEQUI: {formatCurrency(data.nequiAmount)}
                                            </span>
                                        )}
                                        {data.cashAmount > 0 && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                                💵 EFECTIVO: {formatCurrency(data.cashAmount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
                                <p className="text-lg font-black text-emerald-600 tracking-tight">
                                    +{formatCurrency(data.totalProfit)}
                                </p>
                                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none mt-1">
                                    {((profile?.profit_margin || 0.2) * 100).toFixed(0)}% Ganancia Día
                                </p>
                            </div>
                        </div>
                    );
                })}
                {sortedDates.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
                            No hay registros de ventas aún.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

function CurrencyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
