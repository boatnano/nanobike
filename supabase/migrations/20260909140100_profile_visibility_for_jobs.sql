-- Allow customers to see limited rider identity when riders are available,
-- and job participants to see each other after matching.

create policy profiles_select_available_riders on public.profiles
  for select using (
    exists (
      select 1
      from public.rider_profiles rp
      where rp.user_id = profiles.id
        and rp.approval_status = 'approved'
        and rp.is_available = true
        and profiles.account_status = 'active'
    )
  );

create policy profiles_select_job_counterparty on public.profiles
  for select using (
    exists (
      select 1
      from public.jobs j
      where (
          (j.customer_id = auth.uid() and j.rider_id = profiles.id)
          or (j.rider_id = auth.uid() and j.customer_id = profiles.id)
        )
        and j.status not in ('cancelled', 'rejected')
    )
  );
