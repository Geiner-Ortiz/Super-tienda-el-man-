-- 1. Políticas para Profiles
DROP POLICY IF EXISTS "Super admins pueden ver todos los perfiles" ON public.profiles;
CREATE POLICY "Super admins pueden ver todos los perfiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 2. Políticas para Sales
DROP POLICY IF EXISTS "Super admins pueden ver todas las ventas" ON public.sales;
CREATE POLICY "Super admins pueden ver todas las ventas" 
ON public.sales FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 3. Políticas para Expenses
DROP POLICY IF EXISTS "Super admins pueden ver todos los gastos" ON public.expenses;
CREATE POLICY "Super admins pueden ver todos los gastos" 
ON public.expenses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 4. Políticas para Debtors
DROP POLICY IF EXISTS "Super admins pueden ver todos los deudores" ON public.debtors;
CREATE POLICY "Super admins pueden ver todos los deudores" 
ON public.debtors FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
