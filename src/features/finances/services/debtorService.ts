import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/features/admin/store/adminStore';

export interface Debt {
    id: string;
    debtor_id: string;
    amount: number;
    debt_date: string;
    description: string | null;
    is_paid: boolean;
    created_at: string;
}

export interface Debtor {
    id: string;
    name: string;
    phone: string;
    amount: number; // For backward compatibility / summary
    is_paid?: boolean; // For backward compatibility / summary
    created_at: string;
    user_id: string;
    debts?: Debt[];
}

export const debtorService = {
    async getDebtors(): Promise<Debtor[]> {
        const supabase = createClient();
        const { impersonatedUser, isSupportMode } = useAdminStore.getState();
        let query = supabase.from('debtors').select('*, debts(*)').order('created_at', { ascending: false });

        if (isSupportMode && impersonatedUser) {
            query = query.eq('user_id', impersonatedUser.id);
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                query = query.eq('user_id', user.id);
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        // Ensure debts are ordered by date
        const debtors = (data || []).map((debtor: any) => ({
            ...debtor,
            debts: (debtor.debts || []).sort((a: any, b: any) =>
                new Date(b.debt_date).getTime() - new Date(a.debt_date).getTime()
            )
        }));

        return debtors;
    },

    async createDebtor(debtor: Omit<Debtor, 'id' | 'created_at' | 'user_id'>): Promise<Debtor> {
        const supabase = createClient();
        const { impersonatedUser, isSupportMode } = useAdminStore.getState();
        let userId: string;

        if (isSupportMode && impersonatedUser) {
            userId = impersonatedUser.id;
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            userId = user.id;
        }

        const { data, error } = await supabase
            .from('debtors')
            .insert([{ ...debtor, user_id: userId, is_paid: false }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateDebtor(id: string, updates: Partial<Debtor>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('debtors')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteDebtor(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('debtors').delete().eq('id', id);
        if (error) throw error;
    },

    async addDebt(debt: Omit<Debt, 'id' | 'created_at'>): Promise<Debt> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('debts')
            .insert([debt])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateDebt(id: string, updates: Partial<Debt>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('debts')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteDebt(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
