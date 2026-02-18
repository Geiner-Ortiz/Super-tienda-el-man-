-- Trigger function for new sales (Notifies only balance)
CREATE OR REPLACE FUNCTION notify_sales_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- We removed individual sale alerts based on user request
  -- Only perform balance check
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new expenses (Notifies only balance)
CREATE OR REPLACE FUNCTION notify_expenses_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- We removed individual expense alerts based on user request
  -- Only perform balance check
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unique function to check Monthly Balance
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

  -- "En Vivo": If balance is negative, alert the user now.
  -- To avoid spamming on every transaction if it stays negative, we limit it.
  -- But "En Vivo" implies immediate feedback.
  -- Let's say we alert if it's negative AND we haven't alerted TODAY yet.
  
  IF current_balance < 0 THEN
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND type = 'appointment_cancelled' -- Using Red Icon/Color for negative balance
        AND title = '⚠️ Números en Rojo - Balance Mensual'
        AND created_at::date = CURRENT_DATE
     ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, is_read)
        VALUES (
          target_user_id,
          'appointment_cancelled', -- Maps to Red Color in UI
          '⚠️ Números en Rojo - Balance Mensual',
          'Atención: Tu balance del mes es negativo ($' || current_balance || '). Revisa tus gastos.',
          false
        );
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
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
