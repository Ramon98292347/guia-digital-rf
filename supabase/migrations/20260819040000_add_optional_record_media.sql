alter table public.wifi_networks
  add column if not exists image_media_id uuid,
  add column if not exists video_media_id uuid,
  add column if not exists video_cover_media_id uuid;

alter table public.local_tips
  add column if not exists image_media_id uuid,
  add column if not exists video_media_id uuid,
  add column if not exists video_cover_media_id uuid;

alter table public.contacts
  add column if not exists image_media_id uuid,
  add column if not exists video_media_id uuid,
  add column if not exists video_cover_media_id uuid;

alter table public.rules
  add column if not exists image_media_id uuid,
  add column if not exists video_media_id uuid,
  add column if not exists video_cover_media_id uuid;

alter table public.services
  add column if not exists image_media_id uuid,
  add column if not exists video_media_id uuid,
  add column if not exists video_cover_media_id uuid;

do $$
declare
  entity text;
  column_name text;
begin
  foreach entity in array array['wifi_networks', 'local_tips', 'contacts', 'rules', 'services'] loop
    foreach column_name in array array['image_media_id', 'video_media_id', 'video_cover_media_id'] loop
      execute format(
        'alter table public.%I add constraint %I foreign key (tenant_id, %I) references public.media(tenant_id, id) on delete set null',
        entity,
        entity || '_' || column_name || '_tenant_fk',
        column_name
      );
    end loop;
  end loop;
end $$;

comment on column public.wifi_networks.image_media_id is 'Optional image selected from tenant media library.';
comment on column public.wifi_networks.video_media_id is 'Optional video selected from tenant media library.';
comment on column public.wifi_networks.video_cover_media_id is 'Optional video cover selected from tenant media library.';
