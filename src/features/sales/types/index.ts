export interface Sale {
    id: string;
    amount: number;
    profit: number;
    sale_date: string;
    user_id: string;
    created_at: string;
    profiles?: {
        full_name: string | null;
    };
}

export interface CreateSaleInput {
    amount: number;
    sale_date?: string;
}
