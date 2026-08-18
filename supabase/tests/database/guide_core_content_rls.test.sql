begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

create temporary table content_test_ids (
  tenant_a uuid not null,
  tenant_b uuid not null,
  admin_a uuid not null,
  admin_b uuid not null,
  staff_a uuid not null,
  common_user uuid not null,
  super_admin uuid not null,
  media_a uuid not null,
  media_b uuid not null,
  accommodation_a uuid not null,
  accommodation_b uuid not null,
  amenity_a uuid not null,
  amenity_b uuid not null,
  gallery_category_a uuid not null,
  gallery_category_b uuid not null
) on commit drop;

grant select on content_test_ids to anon, authenticated;

with ids as (
  select
    gen_random_uuid() as admin_a,
    gen_random_uuid() as admin_b,
    gen_random_uuid() as staff_a,
    gen_random_uuid() as common_user,
    gen_random_uuid() as super_admin
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
    (ids.admin_a, 'content-admin-a@example.test'),
    (ids.admin_b, 'content-admin-b@example.test'),
    (ids.staff_a, 'content-staff-a@example.test'),
    (ids.common_user, 'content-common@example.test'),
    (ids.super_admin, 'content-super-admin@example.test')
) as users(user_id, email);

insert into content_test_ids
select
  gen_random_uuid(),
  gen_random_uuid(),
  (select id from auth.users where email = 'content-admin-a@example.test'),
  (select id from auth.users where email = 'content-admin-b@example.test'),
  (select id from auth.users where email = 'content-staff-a@example.test'),
  (select id from auth.users where email = 'content-common@example.test'),
  (select id from auth.users where email = 'content-super-admin@example.test'),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid(),
  gen_random_uuid();

insert into public.tenants (id, name, slug, status, published_at)
select tenant_a, 'Tenant A Conteúdo', 'tenant-a-conteudo', 'active', now() from content_test_ids
union all
select tenant_b, 'Tenant B Conteúdo', 'tenant-b-conteudo', 'active', now() from content_test_ids;

insert into public.tenant_members (tenant_id, user_id, role, status)
select tenant_a, admin_a, 'tenant_admin', 'active' from content_test_ids
union all
select tenant_b, admin_b, 'tenant_admin', 'active' from content_test_ids
union all
select tenant_a, staff_a, 'tenant_staff', 'active' from content_test_ids;

insert into public.super_admins (user_id, is_active)
select super_admin, true from content_test_ids;

insert into public.media (id, tenant_id, media_type, storage_bucket, storage_path, status)
select media_a, tenant_a, 'image', 'tenant-media', 'tenant-a/image-a.jpg', 'ready' from content_test_ids
union all
select media_b, tenant_b, 'image', 'tenant-media', 'tenant-b/image-b.jpg', 'ready' from content_test_ids;

insert into public.accommodations (id, tenant_id, name, slug, status)
select accommodation_a, tenant_a, 'Acomodação A', 'acomodacao-a', 'draft' from content_test_ids
union all
select accommodation_b, tenant_b, 'Acomodação B', 'acomodacao-b', 'draft' from content_test_ids;

insert into public.amenities (id, tenant_id, name, status)
select amenity_a, tenant_a, 'Comodidade A', 'published' from content_test_ids
union all
select amenity_b, tenant_b, 'Comodidade B', 'published' from content_test_ids;

insert into public.gallery_categories (id, tenant_id, name, slug, status)
select gallery_category_a, tenant_a, 'Categoria A', 'categoria-a', 'published' from content_test_ids
union all
select gallery_category_b, tenant_b, 'Categoria B', 'categoria-b', 'published' from content_test_ids;

insert into public.wifi_networks (tenant_id, name, ssid, password, status)
select tenant_a, 'Wi-Fi A', 'ssid-a', 'senha-a', 'published' from content_test_ids
union all
select tenant_b, 'Wi-Fi B', 'ssid-b', 'senha-b', 'published' from content_test_ids;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', (select admin_a::text from content_test_ids), true);

select lives_ok(
  $$
    insert into public.accommodations (tenant_id, name, slug, status)
    select tenant_a, 'Nova Acomodação A', 'nova-acomodacao-a', 'draft' from content_test_ids
  $$,
  'Admin A cria acomodação no Tenant A'
);

select throws_ok(
  $$
    insert into public.accommodations (tenant_id, name, slug, status)
    select tenant_b, 'Acomodação indevida', 'acomodacao-indevida', 'draft' from content_test_ids
  $$,
  '42501',
  null,
  'Admin A não cria acomodação no Tenant B'
);

select throws_ok(
  $$
    update public.accommodations
    set tenant_id = (select tenant_b from content_test_ids)
    where id = (select accommodation_a from content_test_ids)
  $$,
  '42501',
  null,
  'Admin A não altera tenant_id da acomodação'
);

select throws_ok(
  $$
    insert into public.accommodation_amenities (tenant_id, accommodation_id, amenity_id)
    select tenant_a, accommodation_a, amenity_b from content_test_ids
  $$,
  '23503',
  null,
  'Banco bloqueia acomodação Tenant A com comodidade Tenant B'
);

select throws_ok(
  $$
    update public.accommodations
    set cover_media_id = (select media_b from content_test_ids)
    where id = (select accommodation_a from content_test_ids)
  $$,
  '23503',
  null,
  'Banco bloqueia capa de acomodação com mídia de outro tenant'
);

select throws_ok(
  $$
    insert into public.accommodation_media (tenant_id, accommodation_id, media_id)
    select tenant_a, accommodation_a, media_b from content_test_ids
  $$,
  '23503',
  null,
  'Banco bloqueia galeria de acomodação com mídia de outro tenant'
);

select throws_ok(
  $$
    insert into public.gallery_items (tenant_id, category_id, media_id, status)
    select tenant_a, gallery_category_a, media_b, 'draft' from content_test_ids
  $$,
  '23503',
  null,
  'Banco bloqueia item de galeria com mídia de outro tenant'
);

select throws_ok(
  $$
    insert into public.gallery_items (tenant_id, category_id, media_id, status)
    select tenant_a, gallery_category_b, media_a, 'draft' from content_test_ids
  $$,
  '23503',
  null,
  'Banco bloqueia item de galeria com categoria de outro tenant'
);

select is(
  (select count(*) from public.wifi_networks where tenant_id = (select tenant_a from content_test_ids)),
  1::bigint,
  'Admin A lê Wi-Fi do Tenant A'
);

select is(
  (select count(*) from public.wifi_networks where tenant_id = (select tenant_b from content_test_ids)),
  0::bigint,
  'Admin A não lê Wi-Fi do Tenant B'
);

update public.wifi_networks
set password = 'nova-senha-a'
where tenant_id = (select tenant_a from content_test_ids);

select is(
  (select password from public.wifi_networks where tenant_id = (select tenant_a from content_test_ids)),
  'nova-senha-a',
  'Admin A altera Wi-Fi do Tenant A'
);

select set_config('request.jwt.claim.sub', (select staff_a::text from content_test_ids), true);

select lives_ok(
  $$
    insert into public.rules (tenant_id, category, title, content, status)
    select tenant_a, 'geral', 'Regra Staff', 'Conteúdo operacional.', 'draft' from content_test_ids
  $$,
  'Staff A cria regra operacional no Tenant A'
);

update public.wifi_networks
set password = 'senha-staff'
where tenant_id = (select tenant_a from content_test_ids);

select set_config('request.jwt.claim.sub', (select admin_a::text from content_test_ids), true);

select is(
  (select password from public.wifi_networks where tenant_id = (select tenant_a from content_test_ids)),
  'nova-senha-a',
  'Staff A não altera senha de Wi-Fi'
);

select set_config('request.jwt.claim.sub', (select super_admin::text from content_test_ids), true);

select is(
  (select count(*) from public.accommodations),
  3::bigint,
  'Super Admin acessa conteúdo global'
);

select lives_ok(
  $$
    insert into public.services (tenant_id, name, slug, price, price_type, status)
    select tenant_b, 'Serviço Super Admin', 'servico-super-admin', 10.50, 'fixed', 'draft' from content_test_ids
  $$,
  'Super Admin cria conteúdo em qualquer tenant'
);

select set_config('request.jwt.claim.sub', (select common_user::text from content_test_ids), true);

select is(
  (select count(*) from public.accommodations),
  0::bigint,
  'Usuário autenticado sem membership não lista conteúdo'
);

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);

select throws_ok($$ select count(*) from public.accommodations $$, '42501', null, 'Anon não lista accommodations');
select throws_ok($$ select count(*) from public.media $$, '42501', null, 'Anon não lista media');
select throws_ok($$ select count(*) from public.services $$, '42501', null, 'Anon não lista services');
select throws_ok($$ select count(*) from public.schedules $$, '42501', null, 'Anon não lista schedules');
select throws_ok($$ select count(*) from public.wifi_networks $$, '42501', null, 'Anon não lista wifi');
select throws_ok($$ select count(*) from public.rules $$, '42501', null, 'Anon não lista rules');
select throws_ok($$ select count(*) from public.contacts $$, '42501', null, 'Anon não lista contacts');
select throws_ok($$ select count(*) from public.gallery_items $$, '42501', null, 'Anon não lista gallery');
select throws_ok($$ select count(*) from public.local_tips $$, '42501', null, 'Anon não lista local tips');

select * from finish();

rollback;
