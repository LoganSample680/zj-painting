-- Run this in Supabase → SQL Editor → New query
-- Sets up the single table that holds all ZJ Painting app data

create table if not exists zj_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  clients   text default '[]',
  bids      text default '[]',
  jobs      text default '[]',
  payments  text default '[]',
  income    text default '[]',
  expenses  text default '[]',
  mileage   text default '[]',
  liens     text default '[]',
  settings  text default '{}',
  updated_at timestamptz default now()
);

-- Only the owner can read/write their own row
alter table zj_data enable row level security;

create policy "Users can manage their own data"
  on zj_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
