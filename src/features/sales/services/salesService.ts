import { createClient } from '@/lib/supabase/client';
import { CreateSaleInput, Sale } from '../types';

export const salesService = {
    async createSale(input: CreateSaleInput): Promise<Sale> {
        const supabase = createClient();

        // Obtener el usuario actual para el campo user_id
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Error getting user:', userError);
            throw new Error('Usuario no autenticado');
        }

        const profit = input.amount * 0.20;

        const { data, error } = await supabase
            .from('sales')
            .insert({
                amount: input.amount,
                profit: profit,
                user_id: user.id,
                sale_date: input.sale_date || new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating sale:', error);
            throw error;
        }

        return data;
    },

    async getSales(startDate?: string, endDate?: string): Promise<Sale[]> {
        const supabase = createClient();

        let query = supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (startDate) {
            query = query.gte('sale_date', startDate);
        }
        if (endDate) {
            query = query.lte('sale_date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching sales:', error);
            throw error;
        }

        return data || [];
    },

    async getProfiles(): Promise<Record<string, string>> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name');

        if (error) {
            console.error('Error fetching profiles:', error);
            throw error;
        }

        const profileMap: Record<string, string> = {};
        data?.forEach((p: any) => {
            profileMap[p.id] = p.full_name || 'Sin nombre';
        });
        return profileMap;
    },

    async deleteSale(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (error) {
            console.error('Error deleting sale:', error);
            throw error;
        }
    }
};
