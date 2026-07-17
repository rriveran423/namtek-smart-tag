alter table public.tags add column if not exists nickname text;
alter table public.tags add column if not exists luggage_type text;
alter table public.tags add column if not exists luggage_brand text;
alter table public.tags add column if not exists luggage_color text;
alter table public.tags add column if not exists luggage_notes text;
alter table public.tags add column if not exists bag_photo_url text;
alter table public.tags add column if not exists traveler_photo_url text;
alter table public.tags add column if not exists show_bag_photo boolean not null default true;
alter table public.tags add column if not exists show_traveler_photo boolean not null default true;
alter table public.tags add column if not exists airline text;
alter table public.tags add column if not exists route_origin text;
alter table public.tags add column if not exists route_destination text;
alter table public.tags add column if not exists route_stops text[] not null default '{}';
alter table public.tags add column if not exists trip_type text not null default 'vacation';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'tags_trip_type_check') then
    alter table public.tags add constraint tags_trip_type_check
      check (trip_type in ('vacation', 'business', 'emergency', 'other'));
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tag-images', 'tag-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners upload tag images" on storage.objects;
drop policy if exists "Owners update tag images" on storage.objects;
drop policy if exists "Owners delete tag images" on storage.objects;
drop policy if exists "Tag images are publicly readable" on storage.objects;

create policy "Owners upload tag images" on storage.objects for insert to authenticated
with check (bucket_id = 'tag-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners update tag images" on storage.objects for update to authenticated
using (bucket_id = 'tag-images' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'tag-images' and owner_id = (select auth.uid()::text));
create policy "Owners delete tag images" on storage.objects for delete to authenticated
using (bucket_id = 'tag-images' and owner_id = (select auth.uid()::text));
create policy "Tag images are publicly readable" on storage.objects for select to anon, authenticated
using (bucket_id = 'tag-images');

drop function if exists public.get_public_tag(text);

create function public.get_public_tag(tag_code text)
returns table (
  public_code text, status text, traveler_name text, finder_message text,
  public_email text, public_phone text, alternate_name text,
  alternate_phone text, preferred_language text, reward_message text,
  nickname text, luggage_type text, luggage_brand text, luggage_color text,
  luggage_notes text, bag_photo_url text, traveler_photo_url text,
  show_bag_photo boolean, show_traveler_photo boolean, airline text,
  route_origin text, route_destination text, route_stops text[], trip_type text
)
language sql security definer set search_path = '' stable
as $$
  select t.public_code, t.status, t.traveler_name, t.finder_message,
         t.public_email, t.public_phone, t.alternate_name,
         t.alternate_phone, t.preferred_language, t.reward_message,
         t.nickname, t.luggage_type, t.luggage_brand, t.luggage_color,
         t.luggage_notes,
         case when t.show_bag_photo then t.bag_photo_url else null end,
         case when t.show_traveler_photo then t.traveler_photo_url else null end,
         t.show_bag_photo, t.show_traveler_photo, t.airline,
         t.route_origin, t.route_destination, t.route_stops, t.trip_type
  from public.tags t
  where t.public_code = upper(tag_code) and t.status in ('active', 'lost')
  limit 1;
$$;

grant execute on function public.get_public_tag(text) to anon, authenticated;
