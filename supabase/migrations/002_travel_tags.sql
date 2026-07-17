create extension if not exists pgcrypto;

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null check (public_code ~ '^[A-Z0-9-]{6,24}$'),
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'unclaimed' check (status in ('unclaimed', 'active', 'lost', 'disabled')),
  traveler_name text,
  finder_message text not null default 'Thank you for finding my luggage. Please contact me so I can arrange its return.',
  public_email text,
  public_phone text,
  alternate_name text,
  alternate_phone text,
  preferred_language text not null default 'English',
  reward_message text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tag_claims (
  tag_id uuid primary key references public.tags(id) on delete cascade,
  token_hash text unique not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tag_scans (
  id bigint generated always as identity primary key,
  tag_id uuid not null references public.tags(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_m double precision check (accuracy_m is null or accuracy_m between 0 and 50000),
  created_at timestamptz not null default now()
);

create index tags_owner_idx on public.tags(owner_id);
create index tag_scans_tag_created_idx on public.tag_scans(tag_id, created_at desc);

alter table public.tags enable row level security;
alter table public.tag_claims enable row level security;
alter table public.tag_scans enable row level security;

create policy "Owners view tags" on public.tags for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owners update tags" on public.tags for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Owners view scans" on public.tag_scans for select to authenticated using (
  exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = (select auth.uid()))
);

create or replace function public.get_public_tag(tag_code text)
returns table (
  public_code text, status text, traveler_name text, finder_message text,
  public_email text, public_phone text, alternate_name text,
  alternate_phone text, preferred_language text, reward_message text
)
language sql security definer set search_path = '' stable
as $$
  select t.public_code, t.status, t.traveler_name, t.finder_message,
         t.public_email, t.public_phone, t.alternate_name,
         t.alternate_phone, t.preferred_language, t.reward_message
  from public.tags t
  where t.public_code = upper(tag_code) and t.status in ('active', 'lost')
  limit 1;
$$;

create or replace function public.record_tag_scan(
  tag_code text, scan_latitude double precision,
  scan_longitude double precision, scan_accuracy double precision default null
)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare target_id uuid;
begin
  select id into target_id from public.tags
  where public_code = upper(tag_code) and status in ('active', 'lost');
  if target_id is null then return false; end if;
  insert into public.tag_scans(tag_id, latitude, longitude, accuracy_m)
  values (target_id, scan_latitude, scan_longitude, scan_accuracy);
  return true;
end;
$$;

create or replace function public.claim_tag(raw_token text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare target_id uuid; claimed_code text;
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  select c.tag_id into target_id from public.tag_claims c
  join public.tags t on t.id = c.tag_id
  where c.token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and c.used_at is null and t.owner_id is null
  for update;
  if target_id is null then raise exception 'Activation code is invalid or already used'; end if;
  update public.tags set owner_id = auth.uid(), status = 'active', claimed_at = now(), updated_at = now()
  where id = target_id returning public_code into claimed_code;
  update public.tag_claims set used_at = now() where tag_id = target_id;
  return claimed_code;
end;
$$;

grant execute on function public.get_public_tag(text) to anon, authenticated;
grant execute on function public.record_tag_scan(text, double precision, double precision, double precision) to anon, authenticated;
grant execute on function public.claim_tag(text) to authenticated;

-- One disposable sample package for testing the complete activation flow.
insert into public.tags (public_code, status, traveler_name, public_email, finder_message)
values ('DEMO-2026', 'active', 'Alex', 'traveler@example.com', 'Thank you for finding this suitcase. Please share its location or contact me so I can arrange pickup.');
insert into public.tag_claims (tag_id, token_hash)
select id, encode(digest('NAMTEK-DEMO-2026', 'sha256'), 'hex') from public.tags where public_code = 'DEMO-2026';
