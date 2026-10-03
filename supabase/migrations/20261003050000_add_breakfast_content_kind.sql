alter table public.content_collections
  drop constraint if exists content_collections_kind_check;

alter table public.content_collections
  add constraint content_collections_kind_check
  check (kind in ('information', 'tutorials', 'shop', 'minibar', 'gastronomy', 'experience', 'promotion', 'breakfast', 'other'));
