begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

create temporary table storage_test_ids (
  tenant_a uuid not null,
  tenant_b uuid not null,
  admin_a uuid not null,
  staff_a uuid not null,
  admin_b uuid not null
) on commit drop;

grant select on storage_test_ids to anon, authenticated;

with ids as (
  select
    gen_random_uuid() as admin_a,
    gen_random_uuid() as staff_a,
    gen_random_uuid() as admin_b
)
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select user_id, 'authenticated', 'authenticated', email, 'test-password', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
from ids
cross join lateral (
  values
    (ids.admin_a, 'storage-admin-a@example.test'),
    (ids.staff_a, 'storage-staff-a@example.test'),
    (ids.admin_b, 'storage-admin-b@example.test')
) as users(user_id, email);

insert into storage_test_ids
select
  gen_random_uuid(),
  gen_random_uuid(),
  (select id from auth.users where email = 'storage-admin-a@example.test'),
  (select id from auth.users where email = 'storage-staff-a@example.test'),
  (select id from auth.users where email = 'storage-admin-b@example.test');

insert into public.tenants (id, name, slug, status, published_at)
select tenant_a, 'Tenant A Storage', 'tenant-a-storage', 'active', now() from storage_test_ids
union all
select tenant_b, 'Tenant B Storage', 'tenant-b-storage', 'active', now() from storage_test_ids;

insert into public.tenant_members (tenant_id, user_id, role, status)
select tenant_a, admin_a, 'tenant_admin', 'active' from storage_test_ids
union all
select tenant_a, staff_a, 'tenant_staff', 'active' from storage_test_ids
union all
select tenant_b, admin_b, 'tenant_admin', 'active' from storage_test_ids;

select is(
  (select count(*) from storage.buckets where id in ('tenant-private-media', 'tenant-public-media')),
  2::bigint,
  'Buckets de mídia existem'
);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', (select admin_a::text from storage_test_ids), true);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      tenant_a::text || '/gallery/11111111-1111-4111-8111-111111111111.webp',
      admin_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  'Admin A envia arquivo privado do Tenant A'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      tenant_b::text || '/gallery/22222222-2222-4222-8222-222222222222.webp',
      admin_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Admin A não envia arquivo privado para Tenant B'
);

select set_config('request.jwt.claim.sub', (select staff_a::text from storage_test_ids), true);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      tenant_a::text || '/services/33333333-3333-4333-8333-333333333333.jpg',
      staff_a,
      '{"mimetype":"image/jpeg","size":1234}'::jsonb
    from storage_test_ids
  $$,
  'Staff A envia mídia privada do Tenant A'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      tenant_b::text || '/services/44444444-4444-4444-8444-444444444444.jpg',
      staff_a,
      '{"mimetype":"image/jpeg","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Staff A não envia mídia privada para Tenant B'
);

select set_config('request.jwt.claim.sub', (select admin_a::text from storage_test_ids), true);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-public-media',
      tenant_a::text || '/gallery/55555555-5555-4555-8555-555555555555.webp',
      admin_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Admin não escreve diretamente no bucket público'
);

select set_config('request.jwt.claim.sub', (select staff_a::text from storage_test_ids), true);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-public-media',
      tenant_a::text || '/gallery/66666666-6666-4666-8666-666666666666.webp',
      staff_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Staff não escreve diretamente no bucket público'
);

select set_config('request.jwt.claim.sub', (select admin_a::text from storage_test_ids), true);

select is(
  (select count(*) from storage.objects where bucket_id = 'tenant-private-media' and name like (select tenant_b::text || '/%' from storage_test_ids)),
  0::bigint,
  'Admin A não lê mídia privada do Tenant B'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      tenant_a::text || '/../gallery/77777777-7777-4777-8777-777777777777.webp',
      admin_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Path traversal é bloqueado'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    select
      'tenant-private-media',
      'gallery/88888888-8888-4888-8888-888888888888.webp',
      admin_a,
      '{"mimetype":"image/webp","size":1234}'::jsonb
    from storage_test_ids
  $$,
  '42501',
  null,
  'Path sem tenant_id é bloqueado'
);

reset role;
insert into storage.objects (bucket_id, name, owner, metadata)
select
  'tenant-public-media',
  tenant_a::text || '/gallery/99999999-9999-4999-8999-999999999999.webp',
  admin_a,
  '{"mimetype":"image/webp","size":1234}'::jsonb
from storage_test_ids;

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);

select is(
  (select count(*) from storage.objects where bucket_id = 'tenant-public-media'),
  1::bigint,
  'Anon lê asset publicado no bucket público'
);

select is(
  (select count(*) from storage.objects where bucket_id = 'tenant-private-media'),
  0::bigint,
  'Anon não lê mídia privada'
);

select * from finish();

rollback;
