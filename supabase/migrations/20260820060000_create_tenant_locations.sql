create table public.tenant_locations (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  title text not null default 'Como chegar' check (length(trim(title)) between 1 and 120),
  address text,
  complement text,
  orientation text,
  google_maps_url text,
  waze_url text,
  optional_url text,
  photo_media_id uuid,
  video_media_id uuid,
  video_cover_media_id uuid,
  is_active boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, photo_media_id),
  unique (tenant_id, video_media_id),
  unique (tenant_id, video_cover_media_id),
  foreign key (tenant_id, photo_media_id) references public.media(tenant_id, id) on delete set null,
  foreign key (tenant_id, video_media_id) references public.media(tenant_id, id) on delete set null,
  foreign key (tenant_id, video_cover_media_id) references public.media(tenant_id, id) on delete set null
);

create trigger set_updated_at_tenant_locations
  before update on public.tenant_locations
  for each row execute function private.set_updated_at();

alter table public.tenant_locations enable row level security;

create policy "members read tenant locations"
  on public.tenant_locations for select to authenticated
  using (private.is_tenant_member(tenant_id));

create policy "tenant admins manage tenant locations"
  on public.tenant_locations for all to authenticated
  using (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));

grant select, insert, update, delete on public.tenant_locations to authenticated;
