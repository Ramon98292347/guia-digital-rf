alter table public.rules
  drop constraint if exists rules_category_check;

alter table public.rules
  add constraint rules_category_check
  check (length(trim(category)) between 1 and 120);
