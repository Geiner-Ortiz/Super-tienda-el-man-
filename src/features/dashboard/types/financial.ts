export interface FinancialStats {
    totalSales: number;
    grossProfit: number; // 20% of totalSales
    totalExpenses: number;
    netIncome: number; // grossProfit - totalExpenses
    fixedExpenses: number;
    variableExpenses: number;
}

export interface DailySalesData {
    date: string;
    amount: number;
    profit: number;
}
