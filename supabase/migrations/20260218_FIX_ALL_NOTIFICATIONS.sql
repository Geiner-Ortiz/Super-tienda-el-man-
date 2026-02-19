-- ============================================================================
-- GLOBAL NOTIFICATION SYSTEM & SALES TRIGGERS (FINAL ROBUST VERSION)
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
    -- Using 'appointment_reminder' as it is a standard allowed type (Bell Icon) 🔔
    INSERT INTO public.notifications (user_id, type, title, message, is_read, data)
    VALUES (
      user_record.id,
      'appointment_reminder', 
      title,
      message,
      false,
      NULL -- Ensure data column is handled
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANT: Grant permission to all authenticated users to run this
GRANT EXECUTE ON FUNCTION send_global_notification TO authenticated;
GRANT EXECUTE ON FUNCTION send_global_notification TO service_role;


-- 2. Function to Check Monthly Balance (for Triggers)
CREATE OR REPLACE FUNCTION check_monthly_server_balance(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  monthly_total_sales DECIMAL;
  monthly_total_expenses DECIMAL;
  current_balance DECIMAL;
  user_profit_margin DECIMAL;
  gross_profit DECIMAL;
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);

  -- Get User Profit Margin (Default 1.0 if not set, meaning 100%)
  SELECT COALESCE(profit_margin, 1.0) INTO user_profit_margin
  FROM public.profiles
  WHERE id = target_user_id;

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

  -- Calculate Balance based on Profit Margin
  -- Real Profit = (Sales * Margin) - Expenses
  gross_profit := monthly_total_sales * user_profit_margin;
  current_balance := gross_profit - monthly_total_expenses;

  -- Alert if balance is negative (and haven't alerted today)
  IF current_balance < 0 THEN
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND title = '⚠️ Números en Rojo - Balance Mensual'
        AND created_at::date = CURRENT_DATE
     ) THEN
        -- Using 'appointment_cancelled' as it is a standard allowed type (Red X) ❌
        INSERT INTO public.notifications (user_id, type, title, message, is_read, data)
        VALUES (
          target_user_id,
          'appointment_cancelled',
          '⚠️ Números en Rojo - Balance Mensual',
          'Atención: Tu ganancia neta del mes es negativa ($' || current_balance || '). Tus gastos superan el margen de ganancia (' || (user_profit_margin * 100)::INTEGER || '%).',
          false,
          NULL
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
