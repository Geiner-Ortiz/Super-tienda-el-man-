-- Function to send a notification to ALL users
-- Can be filtered by role if needed in the future, currently sends to everyone
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
    -- If target_role is specified, check role (optional optimization for future)
    -- For now we just send to everyone or filtered by logic if we add it. 
    -- Let's keep it simple: Send to everyone.
    
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    VALUES (
      user_record.id,
      'info', -- New type for system announcements
      title,
      message,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
