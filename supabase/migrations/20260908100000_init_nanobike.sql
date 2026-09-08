-- nanobike initial schema
create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'rider', 'admin');
create type public.account_status as enum ('active', 'suspended', 'banned');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.location_source as enum ('gps', 'manual');
create type public.distance_source as enum ('road', 'straight');
create type public.earning_status as enum ('pending_review', 'confirmed', 'paid', 'void');
create type public.job_status as enum (
  'pending_rider',
  'going_to_shop',
  'at_shop',
  'quote_pending',
  'awaiting_payment',
  'paid_pending',
  'shopping',
  'delivering',
  'completed',
  'cancelled',
  'rejected',
  'cancelled_shop'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  phone text not null unique,
  email text,
  avatar_url text,
  account_status public.account_status not null default 'active',
  status_reason text,
  admin_note text,
  accepted_rules_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rider_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  promptpay_id text,
  promptpay_qr_url text,
  bank_account_name text,
  approval_status public.approval_status not null default 'pending',
  approval_reason text,
  is_available boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rider_locations (
  rider_id uuid primary key references public.profiles (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy double precision,
  source public.location_source not null default 'gps',
  updated_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  keywords text,
  submitted_by uuid references public.profiles (id),
  status public.approval_status not null default 'pending',
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_earnings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  rider_id uuid not null references public.profiles (id),
  amount_baht numeric(10,2) not null default 1,
  status public.earning_status not null default 'pending_review',
  paid_at timestamptz,
  payout_note text,
  created_at timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  address_text text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  rider_id uuid references public.profiles (id),
  shop_id uuid references public.shops (id),
  shop_name text not null,
  shop_lat double precision not null,
  shop_lng double precision not null,
  dropoff_lat double precision not null,
  dropoff_lng double precision not null,
  dropoff_address text not null,
  dropoff_confirmed boolean not null default false,
  shopping_list text not null,
  goods_budget numeric(12,2),
  goods_quote numeric(12,2),
  goods_confirmed numeric(12,2),
  prefer_transfer_to_shop boolean not null default false,
  km_rider_to_shop numeric(10,3),
  km_shop_to_customer numeric(10,3),
  km_billable numeric(10,3),
  delivery_fee numeric(12,2),
  distance_source public.distance_source,
  status public.job_status not null default 'pending_rider',
  accept_deadline_at timestamptz,
  quote_deadline_at timestamptz,
  pay_deadline_at timestamptz,
  payment_slip_url text,
  goods_proof_url text,
  goods_proof_note text,
  delivery_photo_url text,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id),
  to_user_id uuid not null references public.profiles (id),
  score int not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  unique (job_id, from_user_id)
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id),
  target_user_id uuid references public.profiles (id),
  action text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('delivery', '{"rate_per_km": 3.5, "round_trip_factor": 2, "min_fee": 20}'::jsonb),
  ('timeouts', '{"accept_sec": 300, "quote_sec": 600, "pay_sec": 900}'::jsonb),
  ('brand', '{"name": "nanobike", "name_th": "นาโน Bike"}'::jsonb),
  ('donate', '{"promptpay_id": "", "qr_url": "", "note": "ใช้เป็นค่า server และกองจ่ายหมุดร้าน 1 บาท"}'::jsonb);

create index jobs_status_idx on public.jobs (status);
create index jobs_rider_idx on public.jobs (rider_id);
create index jobs_customer_idx on public.jobs (customer_id);
create index shops_status_idx on public.shops (status);
create index job_events_job_idx on public.job_events (job_id, created_at);

alter table public.profiles enable row level security;
alter table public.rider_profiles enable row level security;
alter table public.rider_locations enable row level security;
alter table public.shops enable row level security;
alter table public.shop_earnings enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
alter table public.ratings enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$;

-- Profiles
create policy profiles_select_own_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin());
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- Rider profiles
create policy rider_profiles_select on public.rider_profiles
  for select using (true);
create policy rider_profiles_upsert_own on public.rider_profiles
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Rider locations: customers see available approved riders
create policy rider_locations_select on public.rider_locations
  for select using (
    public.is_admin()
    or rider_id = auth.uid()
    or exists (
      select 1 from public.rider_profiles rp
      where rp.user_id = rider_locations.rider_id
        and rp.is_available = true
        and rp.approval_status = 'approved'
    )
  );
create policy rider_locations_upsert_own on public.rider_locations
  for all using (rider_id = auth.uid())
  with check (rider_id = auth.uid());

-- Shops: public can read approved
create policy shops_select on public.shops
  for select using (status = 'approved' or submitted_by = auth.uid() or public.is_admin());
create policy shops_insert_rider on public.shops
  for insert with check (
    submitted_by = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'rider')
  );
create policy shops_admin_update on public.shops
  for update using (public.is_admin() or submitted_by = auth.uid());

create policy shop_earnings_select on public.shop_earnings
  for select using (rider_id = auth.uid() or public.is_admin());
create policy shop_earnings_admin on public.shop_earnings
  for all using (public.is_admin()) with check (public.is_admin());

create policy saved_addresses_own on public.saved_addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy jobs_select_participants on public.jobs
  for select using (
    customer_id = auth.uid() or rider_id = auth.uid() or public.is_admin()
  );
create policy jobs_insert_customer on public.jobs
  for insert with check (customer_id = auth.uid());
create policy jobs_update_participants on public.jobs
  for update using (
    customer_id = auth.uid() or rider_id = auth.uid() or public.is_admin()
  );

create policy job_events_select on public.job_events
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_events.job_id
        and (j.customer_id = auth.uid() or j.rider_id = auth.uid())
    )
  );
create policy job_events_insert on public.job_events
  for insert with check (actor_id = auth.uid() or public.is_admin());

create policy ratings_select on public.ratings for select using (true);
create policy ratings_insert on public.ratings
  for insert with check (from_user_id = auth.uid());

create policy admin_audit_admin on public.admin_audit_log
  for all using (public.is_admin()) with check (public.is_admin());

create policy app_settings_read on public.app_settings for select using (true);
create policy app_settings_admin on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Realtime
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.rider_locations;
alter publication supabase_realtime add table public.job_events;
