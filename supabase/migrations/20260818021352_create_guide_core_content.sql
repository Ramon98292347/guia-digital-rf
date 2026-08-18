create table public.media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  media_type text not null check (media_type in ('image', 'video', 'document')),
  storage_bucket text not null check (length(trim(storage_bucket)) between 1 and 80),
  storage_path text not null check (length(trim(storage_path)) between 1 and 500),
  original_filename text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric(10, 2) check (duration_seconds is null or duration_seconds >= 0),
  alt_text text,
  caption text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, storage_bucket, storage_path)
);

create table public.accommodations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  capacity integer check (capacity is null or capacity > 0),
  cover_media_id uuid,
  booking_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, slug),
  foreign key (tenant_id, cover_media_id) references public.media(tenant_id, id) on delete set null
);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  icon text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table public.accommodation_amenities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  accommodation_id uuid not null,
  amenity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, accommodation_id, amenity_id),
  foreign key (tenant_id, accommodation_id) references public.accommodations(tenant_id, id) on delete cascade,
  foreign key (tenant_id, amenity_id) references public.amenities(tenant_id, id) on delete restrict
);

create table public.accommodation_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  accommodation_id uuid not null,
  media_id uuid not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, accommodation_id, media_id),
  foreign key (tenant_id, accommodation_id) references public.accommodations(tenant_id, id) on delete cascade,
  foreign key (tenant_id, media_id) references public.media(tenant_id, id) on delete restrict
);

create unique index accommodation_media_one_cover_per_accommodation
  on public.accommodation_media (tenant_id, accommodation_id)
  where is_cover;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  price_type text not null default 'upon_request' check (price_type in ('fixed', 'starting_from', 'upon_request', 'free')),
  requires_booking boolean not null default false,
  booking_url text,
  contact_action text,
  cover_media_id uuid,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, slug),
  foreign key (tenant_id, cover_media_id) references public.media(tenant_id, id) on delete set null
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  schedule_type text not null check (schedule_type ~ '^[a-z][a-z0-9_]*$'),
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table public.schedule_periods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  schedule_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, schedule_id) references public.schedules(tenant_id, id) on delete cascade,
  constraint schedule_periods_time_required_when_open check (
    (is_closed and opens_at is null and closes_at is null)
    or (not is_closed and opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

create table public.wifi_networks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  ssid text not null check (length(trim(ssid)) between 1 and 160),
  password text,
  area text,
  accommodation_id uuid,
  is_guest_visible boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, accommodation_id) references public.accommodations(tenant_id, id) on delete set null
);

create table public.rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  category text not null check (category ~ '^[a-z][a-z0-9_]*$'),
  title text not null check (length(trim(title)) between 1 and 160),
  content text not null check (length(trim(content)) > 0),
  severity text not null default 'info' check (severity in ('info', 'important', 'critical')),
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  contact_type text not null check (contact_type in ('phone', 'whatsapp', 'email', 'instagram', 'website', 'reception', 'emergency')),
  label text not null check (length(trim(label)) between 1 and 120),
  value text not null check (length(trim(value)) between 1 and 300),
  description text,
  is_primary boolean not null default false,
  is_emergency boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create unique index contacts_one_primary_per_type
  on public.contacts (tenant_id, contact_type)
  where is_primary and status <> 'archived';

create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, slug)
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  category_id uuid,
  media_id uuid not null,
  title text,
  caption text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, category_id) references public.gallery_categories(tenant_id, id) on delete set null,
  foreign key (tenant_id, media_id) references public.media(tenant_id, id) on delete restrict
);

create table public.local_tip_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, slug)
);

create table public.local_tips (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  category_id uuid,
  name text not null check (length(trim(name)) between 1 and 160),
  short_description text,
  description text,
  address text,
  latitude numeric(8, 6) check (latitude is null or (latitude >= -90 and latitude <= 90)),
  longitude numeric(9, 6) check (longitude is null or (longitude >= -180 and longitude <= 180)),
  distance_text text,
  phone text,
  whatsapp text,
  website text,
  instagram text,
  opening_hours_text text,
  recommended boolean not null default false,
  cover_media_id uuid,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, id),
  foreign key (tenant_id, category_id) references public.local_tip_categories(tenant_id, id) on delete set null,
  foreign key (tenant_id, cover_media_id) references public.media(tenant_id, id) on delete set null
);

create table public.booking_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  provider text,
  external_url text,
  open_mode text not null default 'external' check (open_mode in ('internal', 'external')),
  button_label text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_tenant_status_idx on public.media (tenant_id, status);
create index accommodations_tenant_status_idx on public.accommodations (tenant_id, status);
create index accommodations_tenant_sort_idx on public.accommodations (tenant_id, sort_order);
create index amenities_tenant_status_idx on public.amenities (tenant_id, status);
create index accommodation_amenities_accommodation_idx on public.accommodation_amenities (tenant_id, accommodation_id);
create index accommodation_amenities_amenity_idx on public.accommodation_amenities (tenant_id, amenity_id);
create index accommodation_media_accommodation_idx on public.accommodation_media (tenant_id, accommodation_id, sort_order);
create index accommodation_media_media_idx on public.accommodation_media (tenant_id, media_id);
create index services_tenant_status_idx on public.services (tenant_id, status);
create index services_tenant_sort_idx on public.services (tenant_id, sort_order);
create index schedules_tenant_status_idx on public.schedules (tenant_id, status);
create index schedule_periods_schedule_day_idx on public.schedule_periods (tenant_id, schedule_id, day_of_week, sort_order);
create index wifi_networks_tenant_status_idx on public.wifi_networks (tenant_id, status);
create index wifi_networks_accommodation_idx on public.wifi_networks (tenant_id, accommodation_id);
create index rules_tenant_status_idx on public.rules (tenant_id, status);
create index contacts_tenant_status_idx on public.contacts (tenant_id, status);
create index gallery_categories_tenant_status_idx on public.gallery_categories (tenant_id, status);
create index gallery_items_category_idx on public.gallery_items (tenant_id, category_id, sort_order);
create index gallery_items_media_idx on public.gallery_items (tenant_id, media_id);
create index local_tip_categories_tenant_status_idx on public.local_tip_categories (tenant_id, status);
create index local_tips_category_idx on public.local_tips (tenant_id, category_id, sort_order);
create index local_tips_tenant_status_idx on public.local_tips (tenant_id, status);

create trigger set_updated_at_media before update on public.media for each row execute function private.set_updated_at();
create trigger set_updated_at_accommodations before update on public.accommodations for each row execute function private.set_updated_at();
create trigger set_updated_at_amenities before update on public.amenities for each row execute function private.set_updated_at();
create trigger set_updated_at_services before update on public.services for each row execute function private.set_updated_at();
create trigger set_updated_at_schedules before update on public.schedules for each row execute function private.set_updated_at();
create trigger set_updated_at_schedule_periods before update on public.schedule_periods for each row execute function private.set_updated_at();
create trigger set_updated_at_wifi_networks before update on public.wifi_networks for each row execute function private.set_updated_at();
create trigger set_updated_at_rules before update on public.rules for each row execute function private.set_updated_at();
create trigger set_updated_at_contacts before update on public.contacts for each row execute function private.set_updated_at();
create trigger set_updated_at_gallery_categories before update on public.gallery_categories for each row execute function private.set_updated_at();
create trigger set_updated_at_gallery_items before update on public.gallery_items for each row execute function private.set_updated_at();
create trigger set_updated_at_local_tip_categories before update on public.local_tip_categories for each row execute function private.set_updated_at();
create trigger set_updated_at_local_tips before update on public.local_tips for each row execute function private.set_updated_at();
create trigger set_updated_at_booking_settings before update on public.booking_settings for each row execute function private.set_updated_at();

alter table public.media enable row level security;
alter table public.accommodations enable row level security;
alter table public.amenities enable row level security;
alter table public.accommodation_amenities enable row level security;
alter table public.accommodation_media enable row level security;
alter table public.services enable row level security;
alter table public.schedules enable row level security;
alter table public.schedule_periods enable row level security;
alter table public.wifi_networks enable row level security;
alter table public.rules enable row level security;
alter table public.contacts enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_items enable row level security;
alter table public.local_tip_categories enable row level security;
alter table public.local_tips enable row level security;
alter table public.booking_settings enable row level security;

create policy "members read media" on public.media for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage media" on public.media for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read accommodations" on public.accommodations for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage accommodations" on public.accommodations for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read amenities" on public.amenities for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage amenities" on public.amenities for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read accommodation amenities" on public.accommodation_amenities for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage accommodation amenities" on public.accommodation_amenities for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read accommodation media" on public.accommodation_media for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage accommodation media" on public.accommodation_media for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read services" on public.services for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage services" on public.services for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read schedules" on public.schedules for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage schedules" on public.schedules for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read schedule periods" on public.schedule_periods for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage schedule periods" on public.schedule_periods for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "tenant admins read wifi networks" on public.wifi_networks for select to authenticated using (private.is_tenant_admin(tenant_id));
create policy "tenant admins manage wifi networks" on public.wifi_networks for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));

create policy "members read rules" on public.rules for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage rules" on public.rules for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read contacts" on public.contacts for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage contacts" on public.contacts for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read gallery categories" on public.gallery_categories for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage gallery categories" on public.gallery_categories for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read gallery items" on public.gallery_items for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage gallery items" on public.gallery_items for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read local tip categories" on public.local_tip_categories for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage local tip categories" on public.local_tip_categories for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read local tips" on public.local_tips for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "members manage local tips" on public.local_tips for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));

create policy "members read booking settings" on public.booking_settings for select to authenticated using (private.is_tenant_member(tenant_id));
create policy "tenant admins manage booking settings" on public.booking_settings for all to authenticated using (private.is_tenant_admin(tenant_id)) with check (private.is_tenant_admin(tenant_id));

grant select, insert, update, delete on public.media to authenticated;
grant select, insert, update, delete on public.accommodations to authenticated;
grant select, insert, update, delete on public.amenities to authenticated;
grant select, insert, update, delete on public.accommodation_amenities to authenticated;
grant select, insert, update, delete on public.accommodation_media to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.schedules to authenticated;
grant select, insert, update, delete on public.schedule_periods to authenticated;
grant select, insert, update, delete on public.wifi_networks to authenticated;
grant select, insert, update, delete on public.rules to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.gallery_categories to authenticated;
grant select, insert, update, delete on public.gallery_items to authenticated;
grant select, insert, update, delete on public.local_tip_categories to authenticated;
grant select, insert, update, delete on public.local_tips to authenticated;
grant select, insert, update, delete on public.booking_settings to authenticated;

grant all privileges on all tables in schema public to service_role;
