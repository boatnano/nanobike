-- Allow admin to test as rider/customer without changing primary role.

create or replace function public.is_rider_actor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'active'
      and (
        p.role = 'rider'
        or p.role = 'admin'
      )
  );
$$;

create or replace function public.is_customer_actor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'active'
      and (
        p.role = 'customer'
        or p.role = 'admin'
      )
  );
$$;

drop policy if exists shops_insert_rider on public.shops;
create policy shops_insert_rider on public.shops
  for insert with check (
    submitted_by = auth.uid()
    and public.is_rider_actor()
  );

drop policy if exists jobs_insert_customer on public.jobs;
create policy jobs_insert_customer on public.jobs
  for insert with check (
    customer_id = auth.uid()
    and public.is_customer_actor()
  );

-- Ensure every admin has an approved rider profile for testing.
insert into public.rider_profiles (user_id, approval_status, is_available)
select p.id, 'approved'::public.approval_status, false
from public.profiles p
where p.role = 'admin'
on conflict (user_id) do update
set approval_status = 'approved',
    updated_at = now();
