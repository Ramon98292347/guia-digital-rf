create table public.accommodation_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  accommodation_id uuid not null,
  rule_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, accommodation_id, rule_id),
  foreign key (tenant_id, accommodation_id) references public.accommodations(tenant_id, id) on delete cascade,
  foreign key (tenant_id, rule_id) references public.rules(tenant_id, id) on delete cascade
);

create table public.content_collections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  slug text not null check (slug ~ '^[a-z][a-z0-9_-]*$'),
  title text not null check (length(trim(title)) between 1 and 160),
  description text,
  kind text not null check (kind in ('information', 'tutorials', 'shop', 'minibar', 'gastronomy', 'experience', 'other')),
  icon text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, slug)
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  collection_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 200),
  subtitle text,
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  supplier text,
  instructions text,
  alert_text text,
  external_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, collection_id) references public.content_collections(tenant_id, id) on delete cascade
);

create table public.content_item_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  content_item_id uuid not null,
  media_id uuid not null,
  role text not null default 'gallery' check (role in ('cover', 'gallery', 'video', 'thumbnail')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, content_item_id, media_id, role),
  foreign key (tenant_id, content_item_id) references public.content_items(tenant_id, id) on delete cascade,
  foreign key (tenant_id, media_id) references public.media(tenant_id, id) on delete restrict
);

create table public.content_item_accommodations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  content_item_id uuid not null,
  accommodation_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, content_item_id, accommodation_id),
  foreign key (tenant_id, content_item_id) references public.content_items(tenant_id, id) on delete cascade,
  foreign key (tenant_id, accommodation_id) references public.accommodations(tenant_id, id) on delete cascade
);

create index accommodation_rules_tenant_accommodation_idx on public.accommodation_rules (tenant_id, accommodation_id, sort_order);
create index content_collections_tenant_sort_idx on public.content_collections (tenant_id, status, sort_order);
create index content_items_tenant_collection_sort_idx on public.content_items (tenant_id, collection_id, status, sort_order);
create index content_item_media_tenant_item_idx on public.content_item_media (tenant_id, content_item_id, sort_order);
create index content_item_accommodations_tenant_item_idx on public.content_item_accommodations (tenant_id, content_item_id);

create trigger set_updated_at_content_collections before update on public.content_collections for each row execute function private.set_updated_at();
create trigger set_updated_at_content_items before update on public.content_items for each row execute function private.set_updated_at();

alter table public.accommodation_rules enable row level security;
alter table public.content_collections enable row level security;
alter table public.content_items enable row level security;
alter table public.content_item_media enable row level security;
alter table public.content_item_accommodations enable row level security;

create policy "members read accommodation rules" on public.accommodation_rules for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage accommodation rules" on public.accommodation_rules for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));
create policy "members read content collections" on public.content_collections for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage content collections" on public.content_collections for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));
create policy "members read content items" on public.content_items for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage content items" on public.content_items for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));
create policy "members read content item media" on public.content_item_media for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage content item media" on public.content_item_media for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));
create policy "members read content item accommodations" on public.content_item_accommodations for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage content item accommodations" on public.content_item_accommodations for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));

grant select, insert, update, delete on public.accommodation_rules to authenticated;
grant select, insert, update, delete on public.content_collections to authenticated;
grant select, insert, update, delete on public.content_items to authenticated;
grant select, insert, update, delete on public.content_item_media to authenticated;
grant select, insert, update, delete on public.content_item_accommodations to authenticated;
