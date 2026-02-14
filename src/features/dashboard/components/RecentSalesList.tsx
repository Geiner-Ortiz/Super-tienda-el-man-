'use client';

import { useDashboardStore } from '../store/dashboardStore';
import { salesService } from '../../sales/services/salesService';

export function RecentSalesList() {
    const { recentSales, profileMap, setStats, setLoading } = useDashboardStore();

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;

        try {
            setLoading(true);
            await salesService.deleteSale(id);
            const updatedSales = await salesService.getSales();
            setStats(updatedSales);
        } catch (error) {
            alert('Error al eliminar la venta');
        } finally {
            setLoading(false);
        }
    };

    if (recentSales.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No hay ventas registradas recientemente.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Monto</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Ganancia (20%)</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Vendedor</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                {new Date(sale.sale_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                                ${Number(sale.amount).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right">
                                ${Number(sale.profit).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">
                                {profileMap[sale.user_id] || 'Cargando...'}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleDelete(sale.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 text-sm font-medium transition-colors"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
