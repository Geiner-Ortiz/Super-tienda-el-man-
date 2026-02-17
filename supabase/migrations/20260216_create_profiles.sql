-- 1. Crear la tabla de perfiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'client',
  store_name TEXT DEFAULT 'Mi Tienda',
  profit_margin NUMERIC DEFAULT 0.20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Función para el trigger de nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, store_name, profit_margin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'store_name', 'Mi Tienda'),
    0.20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Opcional: Script para sincronizar usuarios existentes
DO $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, store_name, profit_margin)
  SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', ''), 
    COALESCE(raw_user_meta_data->>'role', 'client'),
    COALESCE(raw_user_meta_data->>'store_name', 'Mi Tienda'),
    0.20
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END $$;
