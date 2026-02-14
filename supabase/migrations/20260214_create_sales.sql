-- Create sales table
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  amount decimal not null check (amount >= 0),
  profit decimal not null check (profit >= 0),
  sale_date date not null default current_date,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.sales enable row level security;

-- Create policies
create policy "Users can view their own sales"
  on public.sales for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sales"
  on public.sales for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sales"
  on public.sales for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own sales"
  on public.sales for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists sales_user_id_idx on public.sales(user_id);
create index if not exists sales_sale_date_idx on public.sales(sale_date);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger on_sales_updated
  before update on public.sales
  for each row
  execute function public.handle_updated_at();
