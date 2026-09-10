-- Bypass Auth HTTP signUp (rejects .local / MX checks / rate limits)
-- by creating members through a security-definer RPC.
-- UI still collects phone+password only; email is synthetic.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.register_member(
  p_phone text,
  p_password text,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_id uuid := gen_random_uuid();
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_name text := trim(coalesce(p_full_name, ''));
  v_email text;
  v_encrypted text;
begin
  if v_phone ~ '^66[0-9]{8,}$' then
    v_phone := '0' || substr(v_phone, 3);
  end if;

  if length(v_phone) < 9 or length(v_phone) > 12 then
    raise exception 'เบอร์โทรไม่ถูกต้อง';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  end if;
  if length(v_name) < 1 then
    raise exception 'กรุณาใส่ชื่อ';
  end if;
  if exists (select 1 from public.profiles where phone = v_phone) then
    raise exception 'เบอร์นี้สมัครแล้ว — เข้าสู่ระบบได้เลย';
  end if;
  if exists (select 1 from auth.users where email = v_phone || '@users.nanobike.app') then
    raise exception 'เบอร์นี้สมัครแล้ว — เข้าสู่ระบบได้เลย';
  end if;

  v_email := v_phone || '@users.nanobike.app';
  v_encrypted := crypt(p_password, gen_salt('bf'));

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    reauthentication_token,
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_id,
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', v_name, 'phone', v_phone),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_id,
    jsonb_build_object(
      'sub', v_id::text,
      'email', v_email,
      'email_verified', true,
      'phone', v_phone
    ),
    'email',
    v_email,
    now(),
    now(),
    now()
  );

  insert into public.profiles (
    id,
    role,
    full_name,
    phone,
    accepted_rules_at
  ) values (
    v_id,
    'customer',
    v_name,
    v_phone,
    now()
  );

  return v_id;
end;
$$;

revoke all on function public.register_member(text, text, text) from public;
grant execute on function public.register_member(text, text, text) to anon, authenticated;

create or replace function public.apply_rider()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'กรุณาเข้าสู่ระบบก่อน';
  end if;

  select role into v_role from public.profiles where id = v_uid;
  if v_role is null then
    raise exception 'ไม่พบบัญชี';
  end if;
  if v_role = 'admin' then
    raise exception 'แอดมินไม่ต้องสมัครไรเดอร์';
  end if;

  insert into public.rider_profiles (user_id, approval_status, is_available)
  values (v_uid, 'pending', false)
  on conflict (user_id) do update
  set
    approval_status = case
      when public.rider_profiles.approval_status = 'rejected' then 'pending'::public.approval_status
      else public.rider_profiles.approval_status
    end,
    updated_at = now();

  update public.profiles
  set role = 'rider', updated_at = now()
  where id = v_uid
    and role = 'customer';
end;
$$;

revoke all on function public.apply_rider() from public;
grant execute on function public.apply_rider() to authenticated;
