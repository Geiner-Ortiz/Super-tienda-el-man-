'use client';

import { Sale } from '../types';
import { Card } from '@/components/ui/card';

interface SalesListProps {
    sales: Sale[];
}

export function SalesList({ sales }: SalesListProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm dark:bg-gray-900">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Ventas Recientes</h3>
                <span className="text-xs text-foreground-secondary">{sales.length} registros</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sales.map((sale) => (
                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-600">
                                <CurrencyIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{formatCurrency(sale.amount)}</p>
                                <p className="text-xs text-foreground-secondary">
                                    {new Date(sale.sale_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-success-600">+{formatCurrency(sale.profit)}</p>
                            <p className="text-[10px] text-foreground-secondary uppercase">20% Ganancia</p>
                        </div>
                    </div>
                ))}
                {sales.length === 0 && (
                    <div className="p-12 text-center text-foreground-secondary">
                        No hay ventas registradas hoy.
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
