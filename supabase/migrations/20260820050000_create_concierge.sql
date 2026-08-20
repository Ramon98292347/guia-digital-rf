create table public.concierge_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  id uuid not null default gen_random_uuid(),
  is_enabled boolean not null default false,
  assistant_name text not null default 'Concierge',
  avatar_media_id uuid,
  welcome_message text,
  fallback_message text,
  fallback_contact_id uuid,
  behavior_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id),
  unique (tenant_id, avatar_media_id),
  unique (tenant_id, fallback_contact_id),
  foreign key (tenant_id, avatar_media_id) references public.media(tenant_id, id) on delete set null,
  foreign key (tenant_id, fallback_contact_id) references public.contacts(tenant_id, id) on delete set null
);

create table public.concierge_knowledge (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  title text not null default 'Base complementar',
  knowledge_json jsonb not null default '{}'::jsonb check (jsonb_typeof(knowledge_json) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id)
);

create index concierge_knowledge_tenant_status_idx
  on public.concierge_knowledge (tenant_id, status, updated_at desc);

create trigger set_updated_at_concierge_settings
  before update on public.concierge_settings
  for each row execute function private.set_updated_at();

create trigger set_updated_at_concierge_knowledge
  before update on public.concierge_knowledge
  for each row execute function private.set_updated_at();

alter table public.concierge_settings enable row level security;
alter table public.concierge_knowledge enable row level security;

create policy "members read concierge settings"
  on public.concierge_settings for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage concierge settings"
  on public.concierge_settings for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

create policy "members read concierge knowledge"
  on public.concierge_knowledge for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage concierge knowledge"
  on public.concierge_knowledge for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

grant select, insert, update, delete on public.concierge_settings to authenticated;
grant select, insert, update, delete on public.concierge_knowledge to authenticated;
