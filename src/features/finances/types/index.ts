
export type ExpenseCategory = 'fijo' | 'variable';
export type ExpenseType = 'alquiler' | 'nomina' | 'comida' | 'deudas' | 'luz' | 'gas' | 'agua' | 'internet' | 'otros';

export interface Expense {
    id: string;
    category: ExpenseCategory;
    type: ExpenseType;
    amount: number;
    description: string | null;
    expense_date: string;
    user_id: string;
    created_at: string;
}

export interface CreateExpenseInput {
    category: ExpenseCategory;
    type: ExpenseType;
    amount: number;
    description?: string;
    expense_date?: string;
}
