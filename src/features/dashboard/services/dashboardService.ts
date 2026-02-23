import { createClient } from '@/lib/supabase/client'
import type { FinancialStats, DailySalesData } from '../types/financial'
import { useAdminStore } from '@/features/admin/store/adminStore'

export const dashboardService = {
  async getFinancialStats(overrideUserId?: string): Promise<FinancialStats> {
    const supabase = createClient()
    let userId: string

    const { impersonatedUser, isSupportMode } = useAdminStore.getState()

    if (overrideUserId) {
      userId = overrideUserId
    } else if (isSupportMode && impersonatedUser) {
      userId = impersonatedUser.id
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      userId = user.id
    }

    // 1. Obtener ventas
    const { data: sales } = await supabase
      .from('sales')
      .select('amount, profit, payment_method')
      .eq('user_id', userId)

    // 2. Obtener gastos
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', userId)

    const totalSales = sales?.reduce((acc, s) => acc + Number(s.amount), 0) || 0
    const nequiSales = sales?.filter(s => s.payment_method === 'nequi').reduce((acc, s) => acc + Number(s.amount), 0) || 0
    const cashSales = sales?.filter(s => s.payment_method === 'cash').reduce((acc, s) => acc + Number(s.amount), 0) || 0
    const grossProfit = sales?.reduce((acc, s) => acc + Number(s.profit), 0) || 0 // Ya es el 20% segun salesService

    const fixedExpenses = expenses?.filter(e => e.category === 'fijo').reduce((acc, e) => acc + Number(e.amount), 0) || 0
    const variableExpenses = expenses?.filter(e => e.category === 'variable').reduce((acc, e) => acc + Number(e.amount), 0) || 0
    const totalExpenses = fixedExpenses + variableExpenses

    return {
      totalSales,
      nequiSales,
      cashSales,
      grossProfit,
      totalExpenses,
      netIncome: grossProfit - totalExpenses,
      fixedExpenses,
      variableExpenses
    }
  },

  async getDailyTrends(days = 7, overrideUserId?: string): Promise<DailySalesData[]> {
    const supabase = createClient()
    let userId: string

    const { impersonatedUser, isSupportMode } = useAdminStore.getState()

    if (overrideUserId) {
      userId = overrideUserId
    } else if (isSupportMode && impersonatedUser) {
      userId = impersonatedUser.id
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      userId = user.id
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data } = await supabase
      .from('sales')
      .select('amount, profit, sale_date')
      .eq('user_id', userId)
      .gte('sale_date', startDate.toISOString().split('T')[0])
      .order('sale_date', { ascending: true })

    // Agrupar por fecha
    const groupedData: Record<string, DailySalesData> = {}

    data?.forEach(sale => {
      if (!groupedData[sale.sale_date]) {
        groupedData[sale.sale_date] = { date: sale.sale_date, amount: 0, profit: 0 }
      }
      groupedData[sale.sale_date].amount += Number(sale.amount)
      groupedData[sale.sale_date].profit += Number(sale.profit)
    })

    return Object.values(groupedData)
  }
}
