-- ============================================================================
-- GLOBAL NOTIFICATION SYSTEM & SALES TRIGGERS
-- Run this script in the Supabase SQL Editor to enable all notification types.
-- ============================================================================

-- 1. Create Function to Send GLOBAL Notifications (for Admin Panel)
CREATE OR REPLACE FUNCTION send_global_notification(
  title TEXT,
  message TEXT,
  target_role TEXT DEFAULT NULL 
)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Iterate over all users in profiles
  FOR user_record IN SELECT id FROM public.profiles LOOP
    -- Insert notification for each user
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    VALUES (
      user_record.id,
      'info', -- Uses the new Blue Info Icon
      title,
      message,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Function to Check Monthly Balance (for Triggers)
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

  -- Alert if balance is negative (and haven't alerted today)
  IF current_balance < 0 THEN
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND title = '⚠️ Números en Rojo - Balance Mensual'
        AND created_at::date = CURRENT_DATE
     ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, is_read)
        VALUES (
          target_user_id,
          'warning', -- Uses the new Yellow Warning Icon
          '⚠️ Números en Rojo - Balance Mensual',
          'Atención: Tu balance del mes es negativo ($' || current_balance || '). Revisa tus gastos.',
          false
        );
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Trigger Function Wrappers
CREATE OR REPLACE FUNCTION notify_sales_updates()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_expenses_updates()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_monthly_server_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Apply Triggers to Tables
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
