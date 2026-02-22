'use client';

import { useDashboardStore } from '../store/dashboardStore';
import { Card } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

export function DashboardStats() {
  const { financialStats, dailyTrends, isLoading } = useDashboardStore();

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
          label="Ganancia Bruta"
          value={formatCurrency(financialStats.grossProfit)}
          color={financialStats.grossProfit >= 0 ? 'text-secondary-600' : 'text-red-600'}
          trend="Antes de gastos"
          isNegative={financialStats.grossProfit < 0}
        />
        <MetricCard
          label="Total Gastos"
          value={formatCurrency(financialStats.totalExpenses)}
          color="text-red-500"
          trend={`Fijos: ${formatCurrency(financialStats.fixedExpenses)}`}
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
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Tendencia de Ventas</h3>
            <p className="text-sm text-foreground-secondary">Historial de los últimos 7 días</p>
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

        {/* Expenses Distribution */}
        <Card className="p-6 md:p-8 border-none shadow-sm dark:bg-gray-900 flex flex-col items-center justify-center">
          <div className="w-full mb-6">
            <h3 className="text-xl font-bold text-foreground">Distribución de Gastos</h3>
            <p className="text-sm text-foreground-secondary">Fijos vs Variables</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detail Area Chart */}
      <Card className="p-6 md:p-8 overflow-hidden border-none shadow-sm dark:bg-gray-900">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Flujo de Ingresos</h3>
          <p className="text-sm text-foreground-secondary">Resumen visual detallado</p>
        </div>
        <div className="h-[250px] w-full">
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
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
