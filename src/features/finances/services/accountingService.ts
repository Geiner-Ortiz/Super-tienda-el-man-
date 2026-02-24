import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/features/admin/store/adminStore';

export interface MonthlyClosure {
    month: string;
    year: number;
    totalSales: number;
    totalExpenses: number;
    grossProfit: number;
    netIncome: number;
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
        // In a real app we might want to aggregate in SQL, but for now we'll do it in JS
        const [{ data: sales }, { data: expenses }] = await Promise.all([
            supabase.from('sales').select('amount, profit, sale_date').eq('user_id', userId),
            supabase.from('expenses').select('amount, expense_date').eq('user_id', userId)
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
                    netIncome: 0
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
                    netIncome: 0
                };
            }
            history[key].totalExpenses += Number(e.amount);
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
