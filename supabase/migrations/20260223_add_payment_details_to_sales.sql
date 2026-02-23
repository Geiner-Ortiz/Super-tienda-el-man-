-- Update sales table to support payment methods and Nequi receipts
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name='sales' and column_name='payment_method') then
        alter table public.sales add column payment_method text check (payment_method in ('cash', 'nequi')) default 'cash';
    end if;

    if not exists (select 1 from information_schema.columns where table_name='sales' and column_name='payment_reference') then
        alter table public.sales add column payment_reference text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='sales' and column_name='receipt_url') then
        alter table public.sales add column receipt_url text;
    end if;
end $$;

-- Update RLS policies is not needed as they apply to the whole row, 
-- but we ensure the indexes exist for performance.
create index if not exists sales_payment_method_idx on public.sales(payment_method);
