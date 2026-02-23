export interface FinancialStats {
    totalSales: number;
    nequiSales: number;
    cashSales: number;
    grossProfit: number; // 20% of totalSales
    totalExpenses: number;
    netIncome: number; // grossProfit - totalExpenses
    fixedExpenses: number;
    variableExpenses: number;
    recentNequiSales: Array<{
        id: string;
        amount: number;
        payment_reference?: string;
        receipt_url?: string;
        created_at: string;
    }>;
}

export interface DailySalesData {
    date: string;
    amount: number;
    profit: number;
}
