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
    { label: 'Ventas Hoy', value: totalSalesToday, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Ganancia Hoy (20%)', value: totalProfitToday, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Ventas Mes', value: totalSalesMonth, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Ganancia Mes (20%)', value: totalProfitMonth, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md ${stat.bg}`}
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
          <p className={`text-3xl font-bold tracking-tight ${stat.color}`}>
            ${stat.value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
          </p>
        </div>
      ))}
    </div>
  );
}
