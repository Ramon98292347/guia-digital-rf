alter table public.content_item_accommodations
  add column if not exists quantity integer not null default 0
  check (quantity >= 0);
