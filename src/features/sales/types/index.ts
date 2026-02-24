export interface Sale {
    id: string;
    amount: number;
    profit: number;
    sale_date: string;
    user_id: string;
    created_at: string;
    payment_method: 'cash' | 'nequi' | 'others';
    payment_reference?: string;
    receipt_url?: string;
    profiles?: {
        full_name: string | null;
    };
}

export interface CreateSaleInput {
    amount: number;
    sale_date?: string;
    payment_method?: 'cash' | 'nequi' | 'others';
    payment_reference?: string;
    receipt_url?: string;
}
