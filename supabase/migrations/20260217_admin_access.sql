-- 1. Función para verificar el rol sin bugs de recursión
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Aplicar permisos a Profiles (esta siempre debe existir)
DROP POLICY IF EXISTS "Super admins pueden ver todos los perfiles" ON public.profiles;
CREATE POLICY "Super admins pueden ver todos los perfiles" 
ON public.profiles FOR SELECT 
USING (public.is_super_admin());

-- 3. Aplicar a Sales (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales') THEN
        DROP POLICY IF EXISTS "Super admins pueden ver todas las ventas" ON public.sales;
        EXECUTE 'CREATE POLICY "Super admins pueden ver todas las ventas" ON public.sales FOR SELECT USING (public.is_super_admin())';
    END IF;
END $$;

-- 4. Aplicar a Expenses (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        DROP POLICY IF EXISTS "Super admins pueden ver todos los gastos" ON public.expenses;
        EXECUTE 'CREATE POLICY "Super admins pueden ver todos los gastos" ON public.expenses FOR SELECT USING (public.is_super_admin())';
    END IF;
END $$;

-- 5. Aplicar a Debtors (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'debtors') THEN
        DROP POLICY IF EXISTS "Super admins pueden ver todos los deudores" ON public.debtors;
        EXECUTE 'CREATE POLICY "Super admins pueden ver todos los deudores" ON public.debtors FOR SELECT USING (public.is_super_admin())';
    END IF;
END $$;
