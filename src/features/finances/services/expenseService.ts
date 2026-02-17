import { createClient } from '@/lib/supabase/client';
import { Expense, CreateExpenseInput, ExpenseCategory } from '../types';
import { useAdminStore } from '@/features/admin/store/adminStore';

export const expenseService = {
    async createExpense(input: CreateExpenseInput): Promise<Expense> {
        const supabase = createClient();
        const { impersonatedUser, isSupportMode } = useAdminStore.getState();
        let userId: string;

        if (isSupportMode && impersonatedUser) {
            userId = impersonatedUser.id;
        } else {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('Usuario no autenticado');
            userId = user.id;
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert({
                ...input,
                user_id: userId,
                expense_date: input.expense_date || new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getExpenses(startDate?: string, endDate?: string, category?: ExpenseCategory): Promise<Expense[]> {
        const supabase = createClient();
        let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });

        const { impersonatedUser, isSupportMode } = useAdminStore.getState();

        if (startDate) query = query.gte('expense_date', startDate);
        if (endDate) query = query.lte('expense_date', endDate);
        if (category) query = query.eq('category', category);

        if (isSupportMode && impersonatedUser) {
            query = query.eq('user_id', impersonatedUser.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async deleteExpense(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
    }
};
