begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

create temporary table test_ids (
  tenant_a uuid not null,
  tenant_b uuid not null,
  admin_a uuid not null,
  admin_b uuid not null,
  staff_a uuid not null,
  common_user uuid not null,
  super_admin uuid not null,
  plan_id uuid not null,
  feature_id uuid not null,
  module_id uuid not null,
  tenant_module_id uuid not null
) on commit drop;

grant select on test_ids to anon, authenticated;

with ids as (
  select
    gen_random_uuid() as tenant_a,
    gen_random_uuid() as tenant_b,
    gen_random_uuid() as admin_a,
    gen_random_uuid() as admin_b,
    gen_random_uuid() as staff_a,
    gen_random_uuid() as common_user,
    gen_random_uuid() as super_admin,
    gen_random_uuid() as plan_id
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
    (ids.admin_a, 'admin-a@example.test'),
    (ids.admin_b, 'admin-b@example.test'),
    (ids.staff_a, 'staff-a@example.test'),
    (ids.common_user, 'common-user@example.test'),
    (ids.super_admin, 'super-admin@example.test')
) as users(user_id, email);

with ids as (
  select
    (select id from auth.users where email = 'admin-a@example.test') as admin_a,
    (select id from auth.users where email = 'admin-b@example.test') as admin_b,
    (select id from auth.users where email = 'staff-a@example.test') as staff_a,
    (select id from auth.users where email = 'common-user@example.test') as common_user,
    (select id from auth.users where email = 'super-admin@example.test') as super_admin,
    gen_random_uuid() as tenant_a,
    gen_random_uuid() as tenant_b,
    gen_random_uuid() as plan_id
)
insert into test_ids (
  tenant_a,
  tenant_b,
  admin_a,
  admin_b,
  staff_a,
  common_user,
  super_admin,
  plan_id,
  feature_id,
  module_id,
  tenant_module_id
)
select
  ids.tenant_a,
  ids.tenant_b,
  ids.admin_a,
  ids.admin_b,
  ids.staff_a,
  ids.common_user,
  ids.super_admin,
  ids.plan_id,
  (select id from public.features where key = 'pwa'),
  (select id from public.modules where key = 'concierge'),
  gen_random_uuid()
from ids;

insert into public.tenants (id, name, slug, status, published_at)
select tenant_a, 'Tenant A Teste', 'tenant-a-teste', 'active', now() from test_ids
union all
select tenant_b, 'Tenant B Teste', 'tenant-b-teste', 'active', now() from test_ids;

insert into public.tenant_domains (tenant_id, hostname, domain_type, status, verification_status, is_primary, verified_at)
select tenant_a, 'tenant-a.example.test', 'custom_domain', 'active', 'verified', true, now() from test_ids
union all
select tenant_b, 'tenant-b.example.test', 'custom_domain', 'active', 'verified', true, now() from test_ids;

insert into public.tenant_members (tenant_id, user_id, role, status)
select tenant_a, admin_a, 'tenant_admin', 'active' from test_ids
union all
select tenant_b, admin_b, 'tenant_admin', 'active' from test_ids
union all
select tenant_a, staff_a, 'tenant_staff', 'active' from test_ids;

insert into public.super_admins (user_id, is_active)
select super_admin, true from test_ids;

insert into public.plans (id, name, slug, status)
select plan_id, 'Plano Teste', 'plano-teste', 'active' from test_ids;

insert into public.plan_features (plan_id, feature_id, enabled)
select plan_id, feature_id, true from test_ids;

insert into public.tenant_subscriptions (tenant_id, plan_id, status)
select tenant_a, plan_id, 'active' from test_ids;

insert into public.tenant_modules (id, tenant_id, module_id, enabled)
select tenant_module_id, tenant_a, module_id, true from test_ids;

insert into public.tenant_branding (tenant_id, primary_color)
select tenant_a, '#112233' from test_ids;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select admin_a::text from test_ids), true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*) from public.tenants where id = (select tenant_a from test_ids)),
  1::bigint,
  'Admin A lê Tenant A'
);

select is(
  (select count(*) from public.tenants where id = (select tenant_b from test_ids)),
  0::bigint,
  'Admin A não lê Tenant B'
);

update public.tenants
set name = 'Tenant B invadido'
where id = (select tenant_b from test_ids);

select is(
  (select name from public.tenants where id = (select tenant_b from test_ids)),
  null,
  'Admin A não atualiza Tenant B'
);

select throws_ok(
  $$
    update public.tenant_modules
    set tenant_id = (select tenant_b from test_ids)
    where id = (select tenant_module_id from test_ids)
  $$,
  '42501',
  null,
  'Admin A não troca tenant_id de registro para Tenant B'
);

select throws_ok(
  $$
    insert into public.tenant_members (tenant_id, user_id, role, status)
    select tenant_a, common_user, 'tenant_admin', 'active' from test_ids
  $$,
  '42501',
  null,
  'Usuário autenticado não cria membership admin sem autorização'
);

select throws_ok(
  $$
    insert into public.super_admins (user_id, is_active)
    select common_user, true from test_ids
  $$,
  '42501',
  null,
  'Usuário comum não se adiciona como Super Admin'
);

update public.tenant_subscriptions
set status = 'cancelled'
where tenant_id = (select tenant_a from test_ids);

select is(
  (select status from public.tenant_subscriptions where tenant_id = (select tenant_a from test_ids)),
  'active',
  'Tenant Admin não troca a própria subscription'
);

select throws_ok(
  $$
    insert into public.tenant_feature_overrides (tenant_id, feature_id, enabled)
    select tenant_a, feature_id, true from test_ids
  $$,
  '42501',
  null,
  'Tenant Admin não libera feature override para si'
);

select set_config('request.jwt.claim.sub', (select staff_a::text from test_ids), true);

update public.tenant_branding
set primary_color = '#123456'
where tenant_id = (select tenant_a from test_ids);

select is(
  (select primary_color from public.tenant_branding where tenant_id = (select tenant_a from test_ids)),
  '#112233',
  'Staff não altera branding do tenant'
);

select is(
  (select count(*) from public.tenants where id = (select tenant_a from test_ids)),
  1::bigint,
  'Staff A lê Tenant A'
);

update public.tenant_domains
set status = 'disabled'
where tenant_id = (select tenant_a from test_ids);

select is(
  (select status from public.tenant_domains where tenant_id = (select tenant_a from test_ids)),
  'active',
  'Staff A não altera domínios'
);

select set_config('request.jwt.claim.sub', (select super_admin::text from test_ids), true);

select is(
  (select count(*) from public.tenants),
  2::bigint,
  'Super Admin lê tenants globalmente'
);

select lives_ok(
  $$
    insert into public.tenant_feature_overrides (tenant_id, feature_id, enabled)
    select tenant_a, feature_id, true from test_ids
  $$,
  'Super Admin libera override'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);

select throws_ok(
  $$ select count(*) from public.tenant_members $$,
  '42501',
  null,
  'Anon não lê memberships'
);

select throws_ok(
  $$ select count(*) from public.tenant_subscriptions $$,
  '42501',
  null,
  'Anon não lê subscriptions completas'
);

select is(
  (select count(*) from public.resolve_tenant('tenant-a.example.test', '/')),
  1::bigint,
  'Tenant ativo e publicado é resolvido por hostname'
);

reset role;
update public.tenants
set status = 'suspended'
where id = (select tenant_b from test_ids);

set local role anon;
select is(
  (select count(*) from public.resolve_tenant('tenant-b.example.test', '/')),
  0::bigint,
  'Tenant suspenso não é resolvido como ativo'
);

select is(
  (select count(*) from public.resolve_tenant('inexistente.example.test', '/')),
  0::bigint,
  'Hostname inexistente não resolve tenant'
);

select * from finish();

rollback;
