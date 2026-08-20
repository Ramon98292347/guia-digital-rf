alter table public.content_collections
  drop constraint if exists content_collections_kind_check;

alter table public.content_collections
  add constraint content_collections_kind_check
  check (kind in ('information', 'tutorials', 'shop', 'minibar', 'gastronomy', 'experience', 'promotion', 'other'));

alter table public.content_items
  add column if not exists category text,
  add column if not exists address text,
  add column if not exists secondary_url text,
  add column if not exists discount_text text,
  add column if not exists validity_text text,
  add column if not exists coupon_code text,
  add column if not exists contact_url text;

comment on column public.content_items.secondary_url is 'Segundo link configurável, como Waze para conteúdos de localização.';
comment on column public.content_items.discount_text is 'Texto configurável do benefício, sem cálculo financeiro.';
comment on column public.content_items.validity_text is 'Prazo ou validade configurável do conteúdo promocional.';
