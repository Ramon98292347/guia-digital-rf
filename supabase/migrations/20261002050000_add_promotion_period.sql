alter table public.content_items
  add column if not exists starts_on date,
  add column if not exists ends_on date;

alter table public.content_items
  add constraint content_items_promotion_period_check
  check (ends_on is null or starts_on is null or ends_on >= starts_on);

comment on column public.content_items.starts_on is 'Data de início da publicação promocional.';
comment on column public.content_items.ends_on is 'Data final da publicação promocional; após esta data o item deixa de aparecer.';
