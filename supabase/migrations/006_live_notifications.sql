-- Live messaging notification preferences. Delivery credentials remain only in Vercel.

alter table public.tags add column if not exists notification_email text;
alter table public.tags add column if not exists notification_sms_phone text;
alter table public.tags add column if not exists notify_by_email boolean not null default false;
alter table public.tags add column if not exists notify_by_sms boolean not null default false;
alter table public.recovery_cases add column if not exists finder_email text;
alter table public.recovery_cases add column if not exists finder_notify_by_email boolean not null default false;
alter table public.recovery_cases add column if not exists finder_reply_code uuid not null default gen_random_uuid();
create unique index if not exists recovery_cases_finder_reply_code_idx on public.recovery_cases(finder_reply_code);

drop function if exists public.submit_finder_handoff(text, text, text, text, text, text);
create function public.submit_finder_handoff(
  tag_code text,
  submitted_name text,
  submitted_contact text,
  submitted_email text,
  submitted_notify_email boolean,
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
  clean_email text := lower(trim(submitted_email));
  raw_token text := gen_random_uuid()::text || gen_random_uuid()::text;
begin
  select id into target_id from public.tags
  where public_code = upper(tag_code) and status in ('active', 'lost');
  if target_id is null then raise exception 'Travel tag is unavailable'; end if;
  if submitted_handoff_type not in ('still_with_me', 'airline', 'airport_lost_found', 'hotel', 'police', 'other') then raise exception 'Invalid handoff type'; end if;
  if clean_email <> '' and clean_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid email address'; end if;

  insert into public.recovery_cases (
    tag_id, finder_token_hash, finder_name, finder_contact, finder_email,
    finder_notify_by_email, handoff_type, handoff_location, finder_note
  ) values (
    target_id, encode(digest(raw_token, 'sha256'), 'hex'),
    nullif(left(trim(submitted_name), 100), ''), nullif(left(trim(submitted_contact), 200), ''),
    nullif(left(clean_email, 320), ''), coalesce(submitted_notify_email, false) and clean_email <> '',
    submitted_handoff_type, nullif(left(trim(submitted_location), 300), ''),
    nullif(left(trim(submitted_note), 2000), '')
  ) returning id into new_case_id;

  if nullif(trim(submitted_note), '') is not null then
    insert into public.recovery_messages(case_id, sender_role, body)
    values (new_case_id, 'finder', left(trim(submitted_note), 2000));
  end if;
  return raw_token;
end;
$$;

drop function if exists public.send_finder_message(text, text);
create function public.send_finder_message(raw_token text, message_body text)
returns uuid
language plpgsql security definer set search_path = 'public', 'extensions'
as $$
declare target_case uuid;
begin
  select id into target_case from public.recovery_cases
  where (finder_token_hash = encode(digest(raw_token, 'sha256'), 'hex') or finder_reply_code::text = raw_token)
    and status not in ('recovered', 'closed');
  if target_case is null then return null; end if;
  if char_length(trim(message_body)) < 1 or char_length(message_body) > 2000 then return null; end if;
  insert into public.recovery_messages(case_id, sender_role, body)
  values (target_case, 'finder', trim(message_body));
  update public.recovery_cases set updated_at = now() where id = target_case;
  return target_case;
end;
$$;

grant execute on function public.submit_finder_handoff(text, text, text, text, boolean, text, text, text) to anon, authenticated;
grant execute on function public.send_finder_message(text, text) to anon, authenticated;

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
  where c.finder_token_hash = encode(digest(raw_token, 'sha256'), 'hex') or c.finder_reply_code::text = raw_token
  limit 1;
$$;
