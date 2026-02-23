import { createClient } from '@/lib/supabase/client';
import { CreateSaleInput, Sale } from '../types';
import { useAdminStore } from '@/features/admin/store/adminStore';

export const salesService = {
    async createSale(input: CreateSaleInput): Promise<Sale> {
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

        const { data: profile } = await supabase
            .from('profiles')
            .select('profit_margin')
            .eq('id', userId)
            .single();

        const saleDate = input.sale_date || new Date().toLocaleDateString('en-CA');

        // 1. Buscar si ya existe una venta para ese día y método
        const { data: existingSale } = await supabase
            .from('sales')
            .select('*')
            .eq('user_id', userId)
            .eq('sale_date', saleDate)
            .eq('payment_method', input.payment_method || 'cash')
            .maybeSingle();

        const margin = profile?.profit_margin || 0.20;
        const newAmount = input.amount;
        const newProfit = newAmount * margin;

        if (existingSale) {
            // 2. ACTUALIZAR (CONSOLIDAR): Sumar nuevo monto al existente
            const totalAmount = Number(existingSale.amount) + newAmount;
            const totalProfit = Number(existingSale.profit) + newProfit;

            // Combinar referencias si existen
            let updatedRefs = existingSale.payment_reference;
            if (input.payment_reference) {
                updatedRefs = updatedRefs
                    ? `${updatedRefs}, ${input.payment_reference}`
                    : input.payment_reference;
            }

            const { data, error } = await supabase
                .from('sales')
                .update({
                    amount: totalAmount,
                    profit: totalProfit,
                    payment_reference: updatedRefs,
                    receipt_url: input.receipt_url || existingSale.receipt_url, // Mantener o actualizar
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSale.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // 3. INSERTAR: Primer registro del día para este método
            const { data, error } = await supabase
                .from('sales')
                .insert({
                    amount: newAmount,
                    profit: newProfit,
                    user_id: userId,
                    sale_date: saleDate,
                    payment_method: input.payment_method || 'cash',
                    payment_reference: input.payment_reference,
                    receipt_url: input.receipt_url,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        if (error) {
            console.error('Error creating sale:', error);
            throw error;
        }

        return data;
    },

    async getSales(startDate?: string, endDate?: string, userId?: string): Promise<Sale[]> {
        const supabase = createClient();

        let query = supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        const { impersonatedUser, isSupportMode } = useAdminStore.getState();

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (isSupportMode && impersonatedUser) {
            query = query.eq('user_id', impersonatedUser.id);
        }
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

    async querySales(dateStr: string): Promise<Sale[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('sale_date', dateStr)
            .order('created_at', { ascending: false });

        if (error) throw error;
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
