-- TradeDesk schema migration
-- Safe to run even if zj_data already exists
-- Run in Supabase → SQL Editor → New query

-- ── 1. accounts ───────────────────────────────────────────────────────
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  phone text,
  email text,
  address text,
  license_info text,
  owner_id uuid,
  created_at timestamptz default now()
);

-- ── 2. users (extends auth.users) ─────────────────────────────────────
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text check (role in ('owner','estimator','technician','apprentice')),
  account_id uuid references accounts(id),
  business_type text,
  created_at timestamptz default now()
);

-- ── 3. account_users ──────────────────────────────────────────────────
create table if not exists account_users (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('owner','estimator','technician','apprentice')),
  created_at timestamptz default now(),
  unique(account_id, user_id)
);

-- ── 4. vehicles ───────────────────────────────────────────────────────
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  name text not null,
  type text,
  vin text,
  odometer_start numeric default 0,
  created_at timestamptz default now()
);

-- ── 5. account_config ─────────────────────────────────────────────────
create table if not exists account_config (
  account_id uuid primary key references accounts(id) on delete cascade,
  business_type text,
  default_job_type text,
  require_estimate boolean default true,
  require_deposit boolean default true,
  allow_full_payment boolean default false,
  show_schedule boolean default true,
  updated_at timestamptz default now()
);

-- ── 6. Add account_id to existing zj_data (safe — skips if exists) ───
alter table zj_data add column if not exists account_id uuid references accounts(id);

-- ── 7. RLS on new tables ──────────────────────────────────────────────
alter table accounts enable row level security;
alter table users enable row level security;
alter table account_users enable row level security;
alter table vehicles enable row level security;
alter table account_config enable row level security;

-- accounts
create policy if not exists "Account members can read"
  on accounts for select
  using (id in (select account_id from account_users where user_id = auth.uid()));

create policy if not exists "Account owner can insert"
  on accounts for insert
  with check (owner_id = auth.uid());

create policy if not exists "Account owner can update"
  on accounts for update
  using (owner_id = auth.uid());

-- users
create policy if not exists "Users read own row"
  on users for select using (id = auth.uid());

create policy if not exists "Users insert own row"
  on users for insert with check (id = auth.uid());

create policy if not exists "Users update own row"
  on users for update using (id = auth.uid());

-- account_users
create policy if not exists "Members read own membership"
  on account_users for select using (user_id = auth.uid());

create policy if not exists "Owner can manage memberships"
  on account_users for all
  using (account_id in (
    select account_id from account_users where user_id = auth.uid() and role = 'owner'
  ));

-- vehicles
create policy if not exists "Account members read vehicles"
  on vehicles for select
  using (account_id in (select account_id from account_users where user_id = auth.uid()));

create policy if not exists "Account owner manages vehicles"
  on vehicles for all
  using (account_id in (
    select account_id from account_users where user_id = auth.uid() and role = 'owner'
  ));

-- account_config
create policy if not exists "Account members read config"
  on account_config for select
  using (account_id in (select account_id from account_users where user_id = auth.uid()));

create policy if not exists "Account owner manages config"
  on account_config for all
  using (account_id in (
    select account_id from account_users where user_id = auth.uid() and role = 'owner'
  ));
