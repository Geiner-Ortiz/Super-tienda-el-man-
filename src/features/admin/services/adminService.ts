import { createClient } from '@/lib/supabase/client'

export const adminService = {
    async getClientFinancials(userId: string) {
        const supabase = createClient()

        // 1. Obtener ventas del cliente
        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('amount, profit')
            .eq('user_id', userId)

        if (salesError) throw salesError

        // 2. Obtener gastos del cliente
        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', userId)

        if (expensesError) throw expensesError

        // 3. Obtener deudores del cliente
        const { data: debtors, error: debtorsError } = await supabase
            .from('debtors')
            .select('balance')
            .eq('user_id', userId)

        if (debtorsError) throw debtorsError

        const totalSales = sales?.reduce((acc, s) => acc + Number(s.amount), 0) || 0
        const totalProfit = sales?.reduce((acc, s) => acc + Number(s.profit), 0) || 0
        const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0
        const totalDebt = debtors?.reduce((acc, d) => acc + Number(d.balance), 0) || 0

        return {
            totalSales,
            totalProfit,
            totalExpenses,
            totalDebt,
            netIncome: totalProfit - totalExpenses,
            debtorCount: debtors?.length || 0
        }
    }
}
