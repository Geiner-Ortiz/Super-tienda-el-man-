-- Create debtors table
create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  amount decimal(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.debtors enable row level security;

-- Create policies
create policy "Users can view their own debtors"
  on public.debtors for select
  using (auth.uid() = user_id);

create policy "Users can insert their own debtors"
  on public.debtors for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own debtors"
  on public.debtors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own debtors"
  on public.debtors for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists debtors_user_id_idx on public.debtors(user_id);
