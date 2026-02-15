'use client';

import { useDashboardStore } from '../store/dashboardStore';

export function DashboardStats() {
  const { totalSalesToday, totalProfitToday, totalSalesMonth, totalProfitMonth, isLoading } = useDashboardStore();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
    </div>;
  }

  const stats = [
    { label: 'Ventas Hoy', value: totalSalesToday, color: 'text-primary-600 dark:text-primary-400', border: 'border-l-primary-500' },
    { label: 'Ganancia Hoy (20%)', value: totalProfitToday, color: 'text-secondary-600 dark:text-secondary-400', border: 'border-l-secondary-500' },
    { label: 'Ventas Mes', value: totalSalesMonth, color: 'text-primary-600 dark:text-primary-400', border: 'border-l-primary-500' },
    { label: 'Ganancia Mes (20%)', value: totalProfitMonth, color: 'text-secondary-600 dark:text-secondary-400', border: 'border-l-secondary-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-6 bg-white dark:bg-gray-900 rounded-3xl border-l-4 shadow-sm transition-all hover:shadow-md ${stat.border} border-y border-r border-gray-100 dark:border-gray-800`}
        >
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
          <p className={`text-3xl font-bold tracking-tight ${stat.color}`}>
            ${stat.value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
          </p>
        </div>
      ))}
    </div>
  );
}
