-- Migration to support multiple debts per debtor
-- 1. Create debts table
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    debt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure debtors table has what it needs (and optionally remove old amount if we want to rely on the debts table)
-- For now, we'll keep debtors.amount as a summary or for backward compatibility if needed, 
-- but the single-date logic will be replaced.

-- 3. Enable RLS for debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for debts
DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
CREATE POLICY "Users can view their own debts" ON public.debts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.debtors
            WHERE debtors.id = debts.debtor_id
            AND debtors.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own debts" ON public.debts;
CREATE POLICY "Users can insert their own debts" ON public.debts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.debtors
            WHERE debtors.id = debtor_id
            AND debtors.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
CREATE POLICY "Users can update their own debts" ON public.debts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.debtors
            WHERE debtors.id = debts.debtor_id
            AND debtors.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;
CREATE POLICY "Users can delete their own debts" ON public.debts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.debtors
            WHERE debtors.id = debts.debtor_id
            AND debtors.user_id = auth.uid()
        )
    );

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS debts_debtor_id_idx ON public.debts(debtor_id);

-- 6. Initial Data Migration (Optional: Move existing debtor.amount to a debt entry)
INSERT INTO public.debts (debtor_id, amount, debt_date, description, is_paid)
SELECT id, amount, created_at::date, 'Deuda inicial', COALESCE(is_paid, FALSE)
FROM public.debtors
WHERE amount > 0;
