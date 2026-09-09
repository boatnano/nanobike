-- Public bucket for job payment slips / delivery proofs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-proofs',
  'job-proofs',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy job_proofs_select on storage.objects
  for select using (bucket_id = 'job-proofs');

create policy job_proofs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'job-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy job_proofs_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'job-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy job_proofs_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'job-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
