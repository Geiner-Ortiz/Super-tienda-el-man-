import { create } from 'zustand';
import { Sale } from '../../sales/types';

interface DashboardState {
    totalSalesToday: number;
    totalProfitToday: number;
    totalSalesMonth: number;
    totalProfitMonth: number;
    recentSales: Sale[];
    profileMap: Record<string, string>;
    isLoading: boolean;
    setStats: (sales: Sale[]) => void;
    setProfiles: (profiles: Record<string, string>) => void;
    setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    totalSalesToday: 0,
    totalProfitToday: 0,
    totalSalesMonth: 0,
    totalProfitMonth: 0,
    recentSales: [],
    profileMap: {},
    isLoading: false,

    setLoading: (loading) => set({ isLoading: loading }),

    setProfiles: (profiles) => set({ profileMap: profiles }),

    setStats: (sales) => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.substring(0, 7); // YYYY-MM

        const todaySales = sales.filter(s => s.sale_date === today);
        const monthSales = sales.filter(s => s.sale_date.startsWith(currentMonth));

        set({
            totalSalesToday: todaySales.reduce((acc, s) => acc + Number(s.amount), 0),
            totalProfitToday: todaySales.reduce((acc, s) => acc + Number(s.profit), 0),
            totalSalesMonth: monthSales.reduce((acc, s) => acc + Number(s.amount), 0),
            totalProfitMonth: monthSales.reduce((acc, s) => acc + Number(s.profit), 0),
            recentSales: sales.slice(0, 10),
        });
    },
}));
