alter table public.tags
  add column if not exists airline_bag_tag_number text,
  add column if not exists checked_bag_count integer not null default 1 check (checked_bag_count between 1 and 20);

alter table public.tag_trips
  add column if not exists arrival_terminal text,
  add column if not exists arrival_gate text,
  add column if not exists baggage_claim text,
  add column if not exists airline_bag_tag_number text,
  add column if not exists checked_bag_count integer not null default 1,
  add column if not exists issue_type text check (issue_type in ('missing', 'damaged'));
