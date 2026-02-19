-- ============================================================================
-- NOTIFICATION SYSTEM INFRASTRUCTURE (CORE)
-- Run this script in the Supabase SQL Editor as a NEW QUERY.
-- ============================================================================

-- 1. Create the Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Real-Time (Supabase Replication)
-- This allows the UI to update instantly when a new row is inserted
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications 
FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (to mark as read)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications 
FOR UPDATE USING (auth.uid() = user_id);

-- Admin/System can insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications 
FOR INSERT WITH CHECK (true);

-- 5. FUNCTION: Send GLOBAL Notifications (Admin Panel)
CREATE OR REPLACE FUNCTION send_global_notification(
  title TEXT,
  message TEXT,
  target_role TEXT DEFAULT NULL 
)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP
    INSERT INTO public.notifications (user_id, type, title, message, is_read, data)
    VALUES (
      user_record.id,
      'appointment_reminder', -- Bell icon fallback icon
      title,
      message,
      false,
      NULL
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION send_global_notification TO authenticated;
GRANT EXECUTE ON FUNCTION send_global_notification TO service_role;


-- 6. FUNCTION: Check Monthly Balance & Alert (Triggers)
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

  SELECT COALESCE(profit_margin, 1.0) INTO user_profit_margin
  FROM public.profiles
  WHERE id = target_user_id;

  SELECT COALESCE(SUM(amount), 0) INTO monthly_total_sales
  FROM public.sales
  WHERE user_id = target_user_id AND sale_date >= current_month_start;

  SELECT COALESCE(SUM(amount), 0) INTO monthly_total_expenses
  FROM public.expenses
  WHERE user_id = target_user_id AND expense_date >= current_month_start;

  gross_profit := monthly_total_sales * user_profit_margin;
  current_balance := gross_profit - monthly_total_expenses;

  IF current_balance < 0 THEN
     IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = target_user_id 
        AND title = '⚠️ Números en Rojo - Balance Mensual'
        AND created_at::date = CURRENT_DATE
     ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, is_read, data)
        VALUES (
          target_user_id,
          'appointment_cancelled', -- Red icon fallback
          '⚠️ Números en Rojo - Balance Mensual',
          'Atención: Tu ganancia neta del mes es negativa ($' || current_balance || '). Tus gastos superan el margen de ganancia (' || (user_profit_margin * 100)::INTEGER || '%).',
          false,
          NULL
        );
     END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Trigger Helpers
CREATE OR REPLACE FUNCTION notify_sales_updates() RETURNS TRIGGER AS $$
BEGIN PERFORM check_monthly_server_balance(NEW.user_id); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_expenses_updates() RETURNS TRIGGER AS $$
BEGIN PERFORM check_monthly_server_balance(NEW.user_id); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. Apply Triggers
DROP TRIGGER IF EXISTS on_sales_balance_check ON public.sales;
CREATE TRIGGER on_sales_balance_check AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION notify_sales_updates();

DROP TRIGGER IF EXISTS on_expenses_balance_check ON public.expenses;
CREATE TRIGGER on_expenses_balance_check AFTER INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION notify_expenses_updates();
