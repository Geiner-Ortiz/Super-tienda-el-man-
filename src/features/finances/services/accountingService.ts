import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/features/admin/store/adminStore';
import { ExpenseType } from '../types';

export interface MonthlyClosure {
    month: string;
    year: number;
    totalSales: number;
    totalExpenses: number;
    grossProfit: number;
    netIncome: number;
    expenseBreakdown: Record<string, number>;
}

export const accountingService = {
    async getMonthlyHistory(): Promise<MonthlyClosure[]> {
        const supabase = createClient();
        const { impersonatedUser, isSupportMode } = useAdminStore.getState();
        let userId: string;

        if (isSupportMode && impersonatedUser) {
            userId = impersonatedUser.id;
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');
            userId = user.id;
        }

        // Fetch all sales and expenses for the user
        const [{ data: sales }, { data: expenses }] = await Promise.all([
            supabase.from('sales').select('amount, profit, sale_date').eq('user_id', userId),
            supabase.from('expenses').select('amount, expense_date, type').eq('user_id', userId)
        ]);

        const history: Record<string, MonthlyClosure> = {};
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        sales?.forEach(s => {
            const date = new Date(s.sale_date + 'T00:00:00');
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (key === currentMonthKey) return; // Exclude current month

            if (!history[key]) {
                history[key] = {
                    month: date.toLocaleString('es-CO', { month: 'long' }),
                    year: date.getFullYear(),
                    totalSales: 0,
                    totalExpenses: 0,
                    grossProfit: 0,
                    netIncome: 0,
                    expenseBreakdown: {}
                };
            }
            history[key].totalSales += Number(s.amount);
            history[key].grossProfit += Number(s.profit);
        });

        expenses?.forEach(e => {
            const date = new Date(e.expense_date + 'T00:00:00');
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (key === currentMonthKey) return;

            if (!history[key]) {
                history[key] = {
                    month: date.toLocaleString('es-CO', { month: 'long' }),
                    year: date.getFullYear(),
                    totalSales: 0,
                    totalExpenses: 0,
                    grossProfit: 0,
                    netIncome: 0,
                    expenseBreakdown: {}
                };
            }
            const amount = Number(e.amount);
            history[key].totalExpenses += amount;

            // Breakdown
            const type = e.type || 'otros';
            history[key].expenseBreakdown[type] = (history[key].expenseBreakdown[type] || 0) + amount;
        });

        return Object.values(history)
            .map(h => ({
                ...h,
                netIncome: h.grossProfit - h.totalExpenses
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                // Simple hack to sort months
                const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                return months.indexOf(b.month) - months.indexOf(a.month);
            });
    }
};
