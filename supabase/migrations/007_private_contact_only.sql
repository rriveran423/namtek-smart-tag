-- Privacy hardening: all finder-to-owner communication now uses NamTek's
-- private recovery thread. Legacy contact values remain owner data but are
-- never returned by the public tag function.

update public.tags set show_direct_contact = false where show_direct_contact = true;

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
         null::text, null::text, null::text, null::text,
         t.preferred_language, t.reward_message, t.nickname, t.luggage_type,
         t.luggage_brand, t.luggage_color, t.luggage_notes,
         case when t.show_bag_photo then t.bag_photo_url else null end,
         case when t.show_traveler_photo then t.traveler_photo_url else null end,
         t.show_bag_photo, t.show_traveler_photo, t.airline,
         t.route_origin, t.route_destination, t.route_stops, t.trip_type,
         false
  from public.tags t
  where t.public_code = upper(tag_code) and t.status in ('active', 'lost')
  limit 1;
$$;

grant execute on function public.get_public_tag(text) to anon, authenticated;
