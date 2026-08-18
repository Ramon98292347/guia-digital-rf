create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to authenticated;

create extension if not exists pgcrypto with schema extensions;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type text not null default 'hospitality' check (length(trim(type)) between 1 and 80),
  status text not null default 'draft' check (status in ('draft', 'active', 'suspended', 'archived')),
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  currency text not null default 'BRL',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  hostname text not null check (
    hostname = lower(hostname)
    and hostname !~ '^https?://'
    and hostname !~ '/$'
    and length(trim(hostname)) between 1 and 253
  ),
  path_prefix text check (path_prefix is null or path_prefix ~ '^/[a-z0-9]+(?:-[a-z0-9]+)*$'),
  domain_type text not null check (domain_type in ('platform_path', 'rf_subdomain', 'custom_domain')),
  status text not null default 'pending' check (status in ('pending', 'verifying', 'active', 'failed', 'disabled')),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'failed')),
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_domains_platform_path_requires_path check (
    (domain_type = 'platform_path' and path_prefix is not null)
    or (domain_type <> 'platform_path' and path_prefix is null)
  )
);

create unique index tenant_domains_hostname_unique
  on public.tenant_domains (hostname)
  where domain_type <> 'platform_path';

create unique index tenant_domains_platform_path_unique
  on public.tenant_domains (hostname, path_prefix)
  where domain_type = 'platform_path';

create unique index tenant_domains_one_active_primary_per_tenant
  on public.tenant_domains (tenant_id)
  where is_primary and status = 'active';

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or length(trim(full_name)) <= 160),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('tenant_staff', 'tenant_admin')),
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table public.super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.features (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete restrict,
  enabled boolean not null default true,
  limit_value integer check (limit_value is null or limit_value >= 0),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, feature_id)
);

create table public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'suspended', 'cancelled')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_subscriptions_valid_period check (ends_at is null or ends_at > starts_at)
);

create unique index tenant_subscriptions_one_current_per_tenant
  on public.tenant_subscriptions (tenant_id)
  where status in ('trialing', 'active');

create table public.tenant_feature_overrides (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  feature_id uuid not null references public.features(id) on delete restrict,
  enabled boolean not null,
  limit_value integer check (limit_value is null or limit_value >= 0),
  source text not null default 'manual' check (source in ('manual', 'contract', 'migration', 'support')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, feature_id)
);

create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  contact_email text,
  contact_phone text,
  whatsapp_phone text,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_branding (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  logo_path text,
  icon_path text,
  primary_color text check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text check (secondary_color is null or secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color text check (background_color is null or background_color ~ '^#[0-9A-Fa-f]{6}$'),
  surface_color text check (surface_color is null or surface_color ~ '^#[0-9A-Fa-f]{6}$'),
  foreground_color text check (foreground_color is null or foreground_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_heading text,
  font_body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_design_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  template_key text,
  design_config jsonb not null default '{}'::jsonb check (jsonb_typeof(design_config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_pwa_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  enabled boolean not null default false,
  name text check (name is null or length(trim(name)) <= 120),
  short_name text check (short_name is null or length(trim(short_name)) <= 40),
  description text,
  theme_color text check (theme_color is null or theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color text check (background_color is null or background_color ~ '^#[0-9A-Fa-f]{6}$'),
  install_prompt_enabled boolean not null default false,
  offline_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  module_id uuid not null references public.modules(id) on delete restrict,
  enabled boolean not null default false,
  sort_order integer not null default 0,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_id)
);

create table public.tenant_home_sections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  section_type text not null check (section_type ~ '^[a-z][a-z0-9_]*$'),
  variant text check (variant is null or variant ~ '^[a-z][a-z0-9_-]*$'),
  title text,
  subtitle text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  content_source text check (content_source is null or content_source in ('manual', 'module', 'system')),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  style_overrides jsonb not null default '{}'::jsonb check (jsonb_typeof(style_overrides) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_navigation (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  label text not null check (length(trim(label)) between 1 and 80),
  icon text,
  destination_type text not null check (destination_type in ('section', 'module', 'url', 'action')),
  destination text not null check (length(trim(destination)) between 1 and 300),
  position text not null default 'primary' check (position in ('primary', 'secondary', 'footer')),
  enabled boolean not null default true,
  highlighted boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) between 1 and 120),
  entity_type text not null check (length(trim(entity_type)) between 1 and 120),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index tenants_status_idx on public.tenants (status);
create index tenant_domains_tenant_id_idx on public.tenant_domains (tenant_id);
create index tenant_domains_status_idx on public.tenant_domains (status);
create index tenant_members_user_id_idx on public.tenant_members (user_id);
create index tenant_members_tenant_status_idx on public.tenant_members (tenant_id, status);
create index tenant_members_user_status_idx on public.tenant_members (user_id, status);
create index plans_status_sort_idx on public.plans (status, sort_order);
create index features_status_sort_idx on public.features (status, sort_order);
create index plan_features_plan_id_idx on public.plan_features (plan_id);
create index plan_features_feature_id_idx on public.plan_features (feature_id);
create index tenant_subscriptions_tenant_status_idx on public.tenant_subscriptions (tenant_id, status);
create index tenant_feature_overrides_tenant_id_idx on public.tenant_feature_overrides (tenant_id);
create index tenant_modules_tenant_sort_idx on public.tenant_modules (tenant_id, sort_order);
create index tenant_home_sections_tenant_sort_idx on public.tenant_home_sections (tenant_id, sort_order);
create index tenant_navigation_tenant_position_sort_idx on public.tenant_navigation (tenant_id, position, sort_order);
create index audit_logs_tenant_created_idx on public.audit_logs (tenant_id, created_at desc);
create index audit_logs_user_created_idx on public.audit_logs (user_id, created_at desc);

create trigger set_updated_at_tenants before update on public.tenants for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_domains before update on public.tenant_domains for each row execute function private.set_updated_at();
create trigger set_updated_at_profiles before update on public.profiles for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_members before update on public.tenant_members for each row execute function private.set_updated_at();
create trigger set_updated_at_plans before update on public.plans for each row execute function private.set_updated_at();
create trigger set_updated_at_features before update on public.features for each row execute function private.set_updated_at();
create trigger set_updated_at_plan_features before update on public.plan_features for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_subscriptions before update on public.tenant_subscriptions for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_feature_overrides before update on public.tenant_feature_overrides for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_settings before update on public.tenant_settings for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_branding before update on public.tenant_branding for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_design_settings before update on public.tenant_design_settings for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_pwa_settings before update on public.tenant_pwa_settings for each row execute function private.set_updated_at();
create trigger set_updated_at_modules before update on public.modules for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_modules before update on public.tenant_modules for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_home_sections before update on public.tenant_home_sections for each row execute function private.set_updated_at();
create trigger set_updated_at_tenant_navigation before update on public.tenant_navigation for each row execute function private.set_updated_at();

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.super_admins sa
    where sa.user_id = auth.uid()
      and sa.is_active
  );
$$;

create or replace function private.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select private.is_super_admin()
    or exists (
      select 1
      from public.tenant_members tm
      where tm.tenant_id = target_tenant_id
        and tm.user_id = auth.uid()
        and tm.status = 'active'
    );
$$;

create or replace function private.is_tenant_admin(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select private.is_super_admin()
    or exists (
      select 1
      from public.tenant_members tm
      where tm.tenant_id = target_tenant_id
        and tm.user_id = auth.uid()
        and tm.role = 'tenant_admin'
        and tm.status = 'active'
    );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.is_tenant_member(uuid) to authenticated;
grant execute on function private.is_tenant_admin(uuid) to authenticated;

create or replace function public.resolve_tenant(p_hostname text, p_pathname text default '/')
returns table (
  tenant_id uuid,
  name text,
  slug text,
  timezone text,
  locale text,
  status text,
  domain_type text,
  canonical_hostname text,
  path_prefix text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with normalized as (
    select
      lower(regexp_replace(coalesce(p_hostname, ''), '^https?://|/+$', '', 'g')) as hostname,
      case
        when coalesce(p_pathname, '') = '' then '/'
        else p_pathname
      end as pathname
  )
  select
    t.id,
    t.name,
    t.slug,
    t.timezone,
    t.locale,
    t.status,
    td.domain_type,
    td.hostname,
    td.path_prefix
  from normalized n
  join public.tenant_domains td
    on td.hostname = n.hostname
   and (
      td.domain_type <> 'platform_path'
      or n.pathname = td.path_prefix
      or n.pathname like td.path_prefix || '/%'
    )
  join public.tenants t on t.id = td.tenant_id
  where t.status = 'active'
    and t.published_at is not null
    and td.status = 'active'
    and td.verification_status = 'verified'
  order by td.is_primary desc, td.created_at asc
  limit 1;
$$;

revoke all on function public.resolve_tenant(text, text) from public;
grant execute on function public.resolve_tenant(text, text) to anon, authenticated;

alter table public.tenants enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_members enable row level security;
alter table public.super_admins enable row level security;
alter table public.plans enable row level security;
alter table public.features enable row level security;
alter table public.plan_features enable row level security;
alter table public.tenant_subscriptions enable row level security;
alter table public.tenant_feature_overrides enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.tenant_branding enable row level security;
alter table public.tenant_design_settings enable row level security;
alter table public.tenant_pwa_settings enable row level security;
alter table public.modules enable row level security;
alter table public.tenant_modules enable row level security;
alter table public.tenant_home_sections enable row level security;
alter table public.tenant_navigation enable row level security;
alter table public.audit_logs enable row level security;

create policy "members read own tenants"
  on public.tenants for select to authenticated
  using (private.is_tenant_member(id));

create policy "super admins manage tenants"
  on public.tenants for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "members read tenant domains"
  on public.tenant_domains for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "super admins manage tenant domains"
  on public.tenant_domains for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or private.is_super_admin());

create policy "users insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members read visible memberships"
  on public.tenant_members for select to authenticated
  using (
    user_id = auth.uid()
    or private.is_tenant_admin(tenant_id)
  );

create policy "super admins manage memberships"
  on public.tenant_members for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "users read own super admin status"
  on public.super_admins for select to authenticated
  using (user_id = auth.uid() or private.is_super_admin());

create policy "super admins manage super admins"
  on public.super_admins for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "authenticated read plans"
  on public.plans for select to authenticated
  using (status = 'active' or private.is_super_admin());

create policy "super admins manage plans"
  on public.plans for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "authenticated read features"
  on public.features for select to authenticated
  using (status = 'active' or private.is_super_admin());

create policy "super admins manage features"
  on public.features for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "authenticated read plan features"
  on public.plan_features for select to authenticated
  using (
    private.is_super_admin()
    or exists (
      select 1 from public.plans p
      where p.id = plan_id and p.status = 'active'
    )
  );

create policy "super admins manage plan features"
  on public.plan_features for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "members read tenant subscriptions"
  on public.tenant_subscriptions for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "super admins manage tenant subscriptions"
  on public.tenant_subscriptions for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "members read tenant feature overrides"
  on public.tenant_feature_overrides for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "super admins manage tenant feature overrides"
  on public.tenant_feature_overrides for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "members read tenant settings"
  on public.tenant_settings for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant settings"
  on public.tenant_settings for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read tenant branding"
  on public.tenant_branding for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant branding"
  on public.tenant_branding for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read tenant design settings"
  on public.tenant_design_settings for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant design settings"
  on public.tenant_design_settings for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read tenant pwa settings"
  on public.tenant_pwa_settings for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant pwa settings"
  on public.tenant_pwa_settings for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "authenticated read modules"
  on public.modules for select to authenticated
  using (status = 'active' or private.is_super_admin());

create policy "super admins manage modules"
  on public.modules for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy "members read tenant modules"
  on public.tenant_modules for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant modules"
  on public.tenant_modules for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read tenant home sections"
  on public.tenant_home_sections for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant home sections"
  on public.tenant_home_sections for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read tenant navigation"
  on public.tenant_navigation for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant navigation"
  on public.tenant_navigation for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "tenant admins read own audit logs"
  on public.audit_logs for select to authenticated
  using (
    private.is_super_admin()
    or (tenant_id is not null and private.is_tenant_admin(tenant_id))
  );

create policy "super admins insert audit logs"
  on public.audit_logs for insert to authenticated
  with check (private.is_super_admin());

revoke all on all tables in schema public from anon, authenticated;
grant select on public.tenants to authenticated;
grant select on public.tenant_domains to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.tenant_members to authenticated;
grant select on public.super_admins to authenticated;
grant select on public.plans to authenticated;
grant select on public.features to authenticated;
grant select on public.plan_features to authenticated;
grant select on public.tenant_subscriptions to authenticated;
grant select on public.tenant_feature_overrides to authenticated;
grant select, insert, update, delete on public.tenant_settings to authenticated;
grant select, insert, update, delete on public.tenant_branding to authenticated;
grant select, insert, update, delete on public.tenant_design_settings to authenticated;
grant select, insert, update, delete on public.tenant_pwa_settings to authenticated;
grant select on public.modules to authenticated;
grant select, insert, update, delete on public.tenant_modules to authenticated;
grant select, insert, update, delete on public.tenant_home_sections to authenticated;
grant select, insert, update, delete on public.tenant_navigation to authenticated;
grant select, insert on public.audit_logs to authenticated;

grant insert, update, delete on public.tenants to authenticated;
grant insert, update, delete on public.tenant_domains to authenticated;
grant insert, update, delete on public.tenant_members to authenticated;
grant insert, update, delete on public.super_admins to authenticated;
grant insert, update, delete on public.plans to authenticated;
grant insert, update, delete on public.features to authenticated;
grant insert, update, delete on public.plan_features to authenticated;
grant insert, update, delete on public.tenant_subscriptions to authenticated;
grant insert, update, delete on public.tenant_feature_overrides to authenticated;
grant insert, update, delete on public.modules to authenticated;

grant all privileges on all tables in schema public to service_role;

insert into public.features (key, name, sort_order) values
  ('pwa', 'PWA', 10),
  ('concierge', 'Concierge', 20),
  ('ai_designer', 'AI Designer', 30),
  ('advanced_branding', 'Branding avançado', 40),
  ('advanced_home_builder', 'Home avançada', 50),
  ('custom_domain', 'Domínio próprio', 60),
  ('rf_subdomain', 'Subdomínio RF', 70),
  ('qr', 'QR Code', 80),
  ('nfc', 'NFC', 90),
  ('guest_experiences', 'Experiências dos hóspedes', 100),
  ('analytics', 'Analytics', 110);

insert into public.modules (key, name, sort_order) values
  ('accommodations', 'Acomodações', 10),
  ('wifi', 'Wi-Fi', 20),
  ('services', 'Serviços', 30),
  ('gallery', 'Galeria', 40),
  ('events', 'Eventos', 50),
  ('promotions', 'Promoções', 60),
  ('restaurant', 'Restaurante', 70),
  ('shop', 'Loja', 80),
  ('minibar', 'Frigobar', 90),
  ('concierge', 'Concierge', 100),
  ('guest_experiences', 'Experiências dos hóspedes', 110);
