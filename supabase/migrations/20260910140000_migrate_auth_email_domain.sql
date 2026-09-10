-- Public Auth signUp rejects reserved TLDs like .local
-- Keep synthetic phone emails on a normal-looking domain instead.

update auth.users
set
  email = replace(email, '@users.nanobike.local', '@users.nanobike.app'),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where email like '%@users.nanobike.local';

update auth.identities
set
  identity_data = jsonb_set(
    identity_data,
    '{email}',
    to_jsonb(
      replace(
        coalesce(identity_data->>'email', ''),
        '@users.nanobike.local',
        '@users.nanobike.app'
      )
    )
  ),
  provider_id = replace(provider_id, '@users.nanobike.local', '@users.nanobike.app'),
  updated_at = now()
where provider = 'email'
  and (
    provider_id like '%@users.nanobike.local'
    or coalesce(identity_data->>'email', '') like '%@users.nanobike.local'
  );
