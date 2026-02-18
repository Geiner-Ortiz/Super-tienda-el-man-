-- 1. Create types for expenses (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM ('fijo', 'variable');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_type') THEN
        CREATE TYPE expense_type AS ENUM ('alquiler', 'empleado', 'comida', 'deudas', 'luz', 'gas', 'agua', 'internet', 'ahorro', 'otros');
    END IF;
END $$;

-- 2. Create expenses table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category expense_category NOT NULL,
    type expense_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for expenses (drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- 5. NOTIFICATION TRIGGERS (Negative Balance Logic)

-- Function to check Monthly Balance
CREATE OR REPLACE FUNCTION check_monthly_server_balance(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  monthly_total_sales DECIMAL;
  monthly_total_expenses DECIMAL;
  current_balance DECIMAL;
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);

  -- Sum SALES for this month
  SELECT COALESCE(SUM(amount), 0) INTO monthly_total_sales
  FROM public.sales
  WHERE user_id = target_user_id 
  AND sale_date >= current_month_start;

  -- Sum EXPENSES for this month
  SELECT COALESCE(SUM(amount), 0) INTO monthly_total_expenses
  FROM public.expenses
  WHERE user_id = target_user_id 
  AND expense_date >= current_month_start;

  current_balance := monthly_total_sales - monthly_total_expenses;

  -- "En Vivo": Alert if negative and not alerted today
  IF current_balance < 0 THEN
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND type = 'appointment_cancelled' -- Red Icon
        AND title = '⚠️ Números en Rojo - Balance Mensual'
        AND created_at::date = CURRENT_DATE
     ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, is_read)
        VALUES (
          target_user_id,
          'appointment_cancelled', 
          '⚠️ Números en Rojo - Balance Mensual',
          'Atención: Tu balance del mes es negativo ($' || current_balance || '). Revisa tus gastos.',
          false
        );
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function wrapper for sales
CREATE OR REPLACE FUNCTION notify_sales_updates()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function wrapper for expenses
CREATE OR REPLACE FUNCTION notify_expenses_updates()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Triggers
DROP TRIGGER IF EXISTS on_sales_balance_check ON public.sales;
CREATE TRIGGER on_sales_balance_check
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION notify_sales_updates();

DROP TRIGGER IF EXISTS on_expenses_balance_check ON public.expenses;
CREATE TRIGGER on_expenses_balance_check
  AFTER INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION notify_expenses_updates();
