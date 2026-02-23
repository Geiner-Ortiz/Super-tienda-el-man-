'use client';

import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Card } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

export function DashboardStats() {
  const { financialStats, dailyTrends, isLoading } = useDashboardStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !financialStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        ))}
      </div>
    );
  }

  const expenseData = [
    { name: 'Fijos', value: financialStats.fixedExpenses },
    { name: 'Variables', value: financialStats.variableExpenses },
  ];

  const paymentData = [
    { name: '📲 Nequi', value: financialStats.nequiSales },
    { name: '💵 Efectivo', value: financialStats.cashSales },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Ventas Totales"
          value={formatCurrency(financialStats.totalSales)}
          color="text-primary-600"
          trend="Impacto Bruto"
        />
        <MetricCard
          label="📲 Nequi Total"
          value={formatCurrency(financialStats.nequiSales)}
          color="text-purple-600"
          trend="Dinero Digital"
        />
        <MetricCard
          label="💵 Efectivo Total"
          value={formatCurrency(financialStats.cashSales)}
          color="text-emerald-600"
          trend="Dinero Físico"
        />
        <MetricCard
          label="Ingreso Neto"
          value={formatCurrency(financialStats.netIncome)}
          color={financialStats.netIncome >= 0 ? 'text-success-600' : 'text-red-600'}
          trend="Resultado Real"
          isHighlight
          isNegative={financialStats.netIncome < 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <Card className="lg:col-span-2 p-6 md:p-8 overflow-hidden border-none shadow-sm dark:bg-gray-900">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-foreground">Tendencia de Ventas</h3>
              <p className="text-sm text-foreground-secondary">Historial de los últimos 7 días</p>
            </div>
            <div className="flex gap-2 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Ventas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Ganancia</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  formatter={(value: any, name: any) => [
                    formatCurrency(value || 0),
                    name === 'amount' ? 'Ventas' : 'Ganancia'
                  ]}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" name="Ventas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="profit" name="Ganancia" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Nequi Visual Feed */}
        <Card className="p-6 border-none shadow-sm dark:bg-gray-900">
          <h3 className="text-lg font-bold text-foreground mb-4">📲 Pagos Nequi Recientes</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {financialStats.recentNequiSales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10 italic">No hay pagos registrados hoy</p>
            ) : (
              financialStats.recentNequiSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group hover:border-primary-500/30 transition-all">
                  <div
                    className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 cursor-pointer relative"
                    onClick={() => sale.receipt_url && setSelectedImage(sale.receipt_url)}
                  >
                    {sale.receipt_url ? (
                      <img src={sale.receipt_url} alt="Nequi" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-xs opacity-50">📱</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{formatCurrency(sale.amount)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">Ref: {sale.payment_reference || 'S/N'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-primary-600 font-bold uppercase">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expenses Distribution */}
        <Card className="p-8 border-none shadow-sm dark:bg-gray-900 flex flex-col items-center">
          <div className="w-full mb-6">
            <h3 className="text-xl font-bold text-foreground">Gastos vs Métodos</h3>
            <p className="text-sm text-foreground-secondary">Distribución del capital</p>
          </div>
          <div className="grid grid-cols-2 w-full gap-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1rem', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[10px] font-black text-center text-gray-400 dark:text-gray-500 uppercase mt-2">Gastos</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1rem', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[10px] font-black text-center text-gray-400 dark:text-gray-500 uppercase mt-2">Ingresos</p>
            </div>
          </div>
        </Card>

        {/* Detail Area Chart */}
        <Card className="p-8 overflow-hidden border-none shadow-sm dark:bg-gray-900">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Flujo de Ingresos</h3>
            <p className="text-sm text-foreground-secondary">Tendencia acumulada</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value || 0)}
                  contentStyle={{ borderRadius: '1rem', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img src={selectedImage} alt="Comprobante Grande" className="max-w-[95vw] max-h-[90vh] rounded-3xl shadow-2xl ring-4 ring-white/10" />
            <button
              className="absolute -top-4 -right-4 bg-primary-600 text-white w-10 h-10 rounded-full font-black text-xl shadow-lg border-2 border-white hover:scale-110 transition-transform"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  trend,
  isHighlight = false,
  isNegative = false
}: {
  label: string;
  value: string;
  color: string;
  trend: string;
  isHighlight?: boolean;
  isNegative?: boolean;
}) {
  return (
    <Card className={`p-6 border-none shadow-sm dark:bg-gray-900 ${isHighlight && !isNegative ? 'ring-2 ring-primary-500/20' : ''} ${isNegative ? 'ring-2 ring-red-500/30 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-2xl font-black tracking-tight ${color}`}>
        {isNegative && '🔴 '}{value}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">{trend}</p>
    </Card>
  );
}
