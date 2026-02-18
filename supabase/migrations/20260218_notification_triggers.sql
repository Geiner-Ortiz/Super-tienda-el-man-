-- Trigger function for new sales
CREATE OR REPLACE FUNCTION notify_new_sale()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, is_read)
  VALUES (
    NEW.user_id,
    'payment_received',
    'Nueva Venta 💰',
    'Se registró una venta por $' || NEW.amount,
    false
  );
  PERFORM check_daily_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new expenses
CREATE OR REPLACE FUNCTION notify_new_expense()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, is_read)
  VALUES (
    NEW.user_id,
    'appointment_cancelled',
    'Nuevo Gasto 💸',
    'Se registró un gasto de $' || NEW.amount || ' (' || NEW.type || ')',
    false
  );
  PERFORM check_daily_balance(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check balance
CREATE OR REPLACE FUNCTION check_daily_balance(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  daily_sales DECIMAL;
  daily_expenses DECIMAL;
  balance DECIMAL;
BEGIN
  -- Calculate only for TODAY to avoid spamming about past months
  SELECT COALESCE(SUM(amount), 0) INTO daily_sales
  FROM public.sales
  WHERE user_id = target_user_id AND sale_date = CURRENT_DATE;

  SELECT COALESCE(SUM(amount), 0) INTO daily_expenses
  FROM public.expenses
  WHERE user_id = target_user_id AND expense_date = CURRENT_DATE;

  balance := daily_sales - daily_expenses;

  -- If balance is negative, alert the user (avoid duplicates for same day if possible, but for now simple insert)
  -- We can check if a notification for this exists today to avoid spam, but let's keep it simple as requested
  IF balance < 0 THEN
     -- Check if we already notified about negative balance today to avoid spam loops
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND type = 'appointment_reminder' 
        AND title = '⚠️ Números en Rojo'
        AND created_at::date = CURRENT_DATE
     ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, is_read)
        VALUES (
          target_user_id,
          'appointment_reminder',
          '⚠️ Números en Rojo',
          'Tu balance del día es negativo ($' || balance || '). Revisa tus gastos.',
          false
        );
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
DROP TRIGGER IF EXISTS on_new_sale_notify ON public.sales;
CREATE TRIGGER on_new_sale_notify
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_sale();

DROP TRIGGER IF EXISTS on_new_expense_notify ON public.expenses;
CREATE TRIGGER on_new_expense_notify
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_expense();
