-- Migración para añadir el correo a los perfiles
-- Fecha: 2026-02-17

-- 1. Añadir columna email a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Actualizar función handle_new_user para incluir el correo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, store_name, profit_margin)
  VALUES (
    new.id,
    new.email, -- El email viene directamente de auth.users
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'store_name', 'Mi Tienda'),
    0.20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sincronizar correos de usuarios existentes
DO $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END $$;
