import { create } from 'zustand';
import { Sale } from '../../sales/types';
import { FinancialStats, DailySalesData } from '../types/financial';

interface DashboardState {
    financialStats: FinancialStats | null;
    dailyTrends: DailySalesData[];
    recentSales: Sale[];
    isLoading: boolean;
    setFinancialData: (stats: FinancialStats, trends: DailySalesData[], recentSales: Sale[]) => void;
    setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    financialStats: null,
    dailyTrends: [],
    recentSales: [],
    isLoading: false,

    setLoading: (loading) => set({ isLoading: loading }),

    setFinancialData: (stats, trends, recentSales) => set({
        financialStats: stats,
        dailyTrends: trends,
        recentSales: recentSales.slice(0, 10),
    }),
}));
