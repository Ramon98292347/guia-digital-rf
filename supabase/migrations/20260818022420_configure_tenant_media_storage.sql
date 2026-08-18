insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'tenant-private-media',
    'tenant-private-media',
    false,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf'
    ]
  ),
  (
    'tenant-public-media',
    'tenant-public-media',
    true,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

create or replace function private.storage_tenant_id(object_name text)
returns uuid
language sql
stable
security invoker
set search_path = storage, pg_temp
as $$
  select case
    when object_name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    then (storage.foldername(object_name))[1]::uuid
    else null
  end;
$$;

create or replace function private.storage_path_is_safe(object_name text)
returns boolean
language sql
immutable
security invoker
set search_path = pg_temp
as $$
  select
    object_name is not null
    and object_name !~ '(^|/)\.\.(/|$)'
    and object_name !~ '\\'
    and object_name !~ '//'
    and object_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(branding|accommodations|gallery|services|local-tips|general)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif|mp4|webm|pdf)$';
$$;

revoke all on function private.storage_tenant_id(text) from public, anon, authenticated;
revoke all on function private.storage_path_is_safe(text) from public, anon, authenticated;
grant execute on function private.storage_tenant_id(text) to authenticated;
grant execute on function private.storage_path_is_safe(text) to anon, authenticated;

create policy "tenant members read private media objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'tenant-private-media'
    and private.storage_path_is_safe(name)
    and private.is_tenant_member(private.storage_tenant_id(name))
  );

create policy "tenant members insert private media objects"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-private-media'
    and private.storage_path_is_safe(name)
    and private.is_tenant_member(private.storage_tenant_id(name))
  );

create policy "tenant members update private media objects"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tenant-private-media'
    and private.storage_path_is_safe(name)
    and private.is_tenant_member(private.storage_tenant_id(name))
  )
  with check (
    bucket_id = 'tenant-private-media'
    and private.storage_path_is_safe(name)
    and private.is_tenant_member(private.storage_tenant_id(name))
  );

create policy "tenant members delete private media objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-private-media'
    and private.storage_path_is_safe(name)
    and private.is_tenant_member(private.storage_tenant_id(name))
  );

create policy "public reads published media objects"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'tenant-public-media'
    and private.storage_path_is_safe(name)
  );
