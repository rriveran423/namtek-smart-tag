-- NamTek Recovery Center: secure finder handoffs, private messages,
-- airline recovery packets, and optional tracker links.

alter table public.tags add column if not exists flight_number text;
alter table public.tags add column if not exists baggage_report_number text;
alter table public.tags add column if not exists tracker_type text;
alter table public.tags add column if not exists tracker_url text;
alter table public.tags add column if not exists recovery_packet_enabled boolean not null default false;
alter table public.tags add column if not exists recovery_share_code uuid not null default gen_random_uuid();
alter table public.tags add column if not exists show_direct_contact boolean not null default true;

create unique index if not exists tags_recovery_share_code_idx on public.tags(recovery_share_code);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'tags_tracker_type_check') then
    alter table public.tags add constraint tags_tracker_type_check
      check (tracker_type is null or tracker_type in ('apple_find_my', 'google_find_hub', 'other'));
  end if;
end $$;

create table if not exists public.recovery_cases (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  finder_token_hash text unique not null,
  finder_name text,
  finder_contact text,
  handoff_type text not null check (handoff_type in ('still_with_me', 'airline', 'airport_lost_found', 'hotel', 'police', 'other')),
  handoff_location text,
  finder_note text,
  status text not null default 'open' check (status in ('open', 'contacted', 'pickup_arranged', 'recovered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recovery_messages (
  id bigint generated always as identity primary key,
  case_id uuid not null references public.recovery_cases(id) on delete cascade,
  sender_role text not null check (sender_role in ('finder', 'owner')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists recovery_cases_tag_created_idx on public.recovery_cases(tag_id, created_at desc);
create index if not exists recovery_messages_case_created_idx on public.recovery_messages(case_id, created_at);

alter table public.recovery_cases enable row level security;
alter table public.recovery_messages enable row level security;

drop policy if exists "Owners view recovery cases" on public.recovery_cases;
drop policy if exists "Owners update recovery cases" on public.recovery_cases;
drop policy if exists "Owners view recovery messages" on public.recovery_messages;
drop policy if exists "Owners send recovery messages" on public.recovery_messages;

create policy "Owners view recovery cases" on public.recovery_cases for select to authenticated using (
  exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = (select auth.uid()))
);
create policy "Owners update recovery cases" on public.recovery_cases for update to authenticated using (
  exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = (select auth.uid()))
) with check (
  exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = (select auth.uid()))
);
create policy "Owners view recovery messages" on public.recovery_messages for select to authenticated using (
  exists (
    select 1 from public.recovery_cases c join public.tags t on t.id = c.tag_id
    where c.id = case_id and t.owner_id = (select auth.uid())
  )
);
create policy "Owners send recovery messages" on public.recovery_messages for insert to authenticated with check (
  sender_role = 'owner' and exists (
    select 1 from public.recovery_cases c join public.tags t on t.id = c.tag_id
    where c.id = case_id and t.owner_id = (select auth.uid())
  )
);

create or replace function public.submit_finder_handoff(
  tag_code text,
  submitted_name text,
  submitted_contact text,
  submitted_handoff_type text,
  submitted_location text,
  submitted_note text
)
returns text
language plpgsql security definer set search_path = 'public', 'extensions'
as $$
declare
  target_id uuid;
  new_case_id uuid;
  raw_token text := gen_random_uuid()::text || gen_random_uuid()::text;
begin
  select id into target_id from public.tags
  where public_code = upper(tag_code) and status in ('active', 'lost');
  if target_id is null then raise exception 'Travel tag is unavailable'; end if;
  if submitted_handoff_type not in ('still_with_me', 'airline', 'airport_lost_found', 'hotel', 'police', 'other') then
    raise exception 'Invalid handoff type';
  end if;

  insert into public.recovery_cases (
    tag_id, finder_token_hash, finder_name, finder_contact,
    handoff_type, handoff_location, finder_note
  ) values (
    target_id, encode(digest(raw_token, 'sha256'), 'hex'),
    nullif(left(trim(submitted_name), 100), ''),
    nullif(left(trim(submitted_contact), 200), ''),
    submitted_handoff_type,
    nullif(left(trim(submitted_location), 300), ''),
    nullif(left(trim(submitted_note), 2000), '')
  ) returning id into new_case_id;

  if nullif(trim(submitted_note), '') is not null then
    insert into public.recovery_messages(case_id, sender_role, body)
    values (new_case_id, 'finder', left(trim(submitted_note), 2000));
  end if;
  return raw_token;
end;
$$;

create or replace function public.get_finder_recovery(raw_token text)
returns jsonb
language sql security definer set search_path = 'public', 'extensions' stable
as $$
  select jsonb_build_object(
    'case', jsonb_build_object(
      'id', c.id, 'finder_name', c.finder_name, 'handoff_type', c.handoff_type,
      'handoff_location', c.handoff_location, 'status', c.status, 'created_at', c.created_at
    ),
    'tag', jsonb_build_object(
      'public_code', t.public_code, 'traveler_name', t.traveler_name,
      'nickname', t.nickname, 'bag_photo_url', case when t.show_bag_photo then t.bag_photo_url else null end
    ),
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'sender_role', m.sender_role, 'body', m.body, 'created_at', m.created_at
      ) order by m.created_at)
      from public.recovery_messages m where m.case_id = c.id
    ), '[]'::jsonb)
  )
  from public.recovery_cases c join public.tags t on t.id = c.tag_id
  where c.finder_token_hash = encode(digest(raw_token, 'sha256'), 'hex')
  limit 1;
$$;

create or replace function public.send_finder_message(raw_token text, message_body text)
returns boolean
language plpgsql security definer set search_path = 'public', 'extensions'
as $$
declare target_case uuid;
begin
  select id into target_case from public.recovery_cases
  where finder_token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and status not in ('recovered', 'closed');
  if target_case is null then return false; end if;
  if char_length(trim(message_body)) < 1 or char_length(message_body) > 2000 then return false; end if;
  insert into public.recovery_messages(case_id, sender_role, body)
  values (target_case, 'finder', trim(message_body));
  update public.recovery_cases set updated_at = now() where id = target_case;
  return true;
end;
$$;

create or replace function public.get_recovery_packet(packet_code uuid)
returns jsonb
language sql security definer set search_path = 'public' stable
as $$
  select jsonb_build_object(
    'tag', jsonb_build_object(
      'public_code', t.public_code, 'traveler_name', t.traveler_name,
      'nickname', t.nickname, 'luggage_type', t.luggage_type,
      'luggage_brand', t.luggage_brand, 'luggage_color', t.luggage_color,
      'luggage_notes', t.luggage_notes, 'bag_photo_url', t.bag_photo_url,
      'airline', t.airline, 'flight_number', t.flight_number,
      'baggage_report_number', t.baggage_report_number,
      'route_origin', t.route_origin, 'route_destination', t.route_destination,
      'route_stops', t.route_stops, 'tracker_type', t.tracker_type,
      'tracker_url', t.tracker_url, 'status', t.status
    ),
    'scans', coalesce((
      select jsonb_agg(jsonb_build_object(
        'latitude', s.latitude, 'longitude', s.longitude,
        'accuracy_m', s.accuracy_m, 'created_at', s.created_at
      ) order by s.created_at desc)
      from (select * from public.tag_scans where tag_id = t.id order by created_at desc limit 20) s
    ), '[]'::jsonb),
    'handoffs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'handoff_type', c.handoff_type, 'handoff_location', c.handoff_location,
        'status', c.status, 'created_at', c.created_at
      ) order by c.created_at desc)
      from public.recovery_cases c where c.tag_id = t.id
    ), '[]'::jsonb)
  )
  from public.tags t
  where t.recovery_share_code = packet_code and t.recovery_packet_enabled = true
  limit 1;
$$;

grant execute on function public.submit_finder_handoff(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_finder_recovery(text) to anon, authenticated;
grant execute on function public.send_finder_message(text, text) to anon, authenticated;
grant execute on function public.get_recovery_packet(uuid) to anon, authenticated;

-- Rebuild the public finder profile so owners can use private messaging without
-- exposing a phone number or email address.
drop function if exists public.get_public_tag(text);
create function public.get_public_tag(tag_code text)
returns table (
  public_code text, status text, traveler_name text, finder_message text,
  public_email text, public_phone text, alternate_name text,
  alternate_phone text, preferred_language text, reward_message text,
  nickname text, luggage_type text, luggage_brand text, luggage_color text,
  luggage_notes text, bag_photo_url text, traveler_photo_url text,
  show_bag_photo boolean, show_traveler_photo boolean, airline text,
  route_origin text, route_destination text, route_stops text[], trip_type text,
  show_direct_contact boolean
)
language sql security definer set search_path = 'public' stable
as $$
  select t.public_code, t.status, t.traveler_name, t.finder_message,
         case when t.show_direct_contact then t.public_email else null end,
         case when t.show_direct_contact then t.public_phone else null end,
         case when t.show_direct_contact then t.alternate_name else null end,
         case when t.show_direct_contact then t.alternate_phone else null end,
         t.preferred_language, t.reward_message, t.nickname, t.luggage_type,
         t.luggage_brand, t.luggage_color, t.luggage_notes,
         case when t.show_bag_photo then t.bag_photo_url else null end,
         case when t.show_traveler_photo then t.traveler_photo_url else null end,
         t.show_bag_photo, t.show_traveler_photo, t.airline,
         t.route_origin, t.route_destination, t.route_stops, t.trip_type,
         t.show_direct_contact
  from public.tags t
  where t.public_code = upper(tag_code) and t.status in ('active', 'lost')
  limit 1;
$$;
grant execute on function public.get_public_tag(text) to anon, authenticated;
