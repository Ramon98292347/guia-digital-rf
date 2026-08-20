alter table public.accommodations
  add column if not exists area_m2 numeric(8, 2) check (area_m2 is null or area_m2 > 0),
  add column if not exists view_description text,
  add column if not exists bed_description text;
