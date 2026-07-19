update public.tags as tag
set
  airline = null,
  flight_number = null,
  flight_date = null,
  route_origin = null,
  route_destination = null,
  route_stops = '{}'::text[],
  baggage_report_number = null,
  updated_at = now()
where exists (
  select 1
  from public.tag_trips as trip
  where trip.tag_id = tag.id
    and trip.status = 'collected'
    and trip.flight_number = tag.flight_number
    and trip.flight_date = tag.flight_date
)
and not exists (
  select 1
  from public.tag_trips as active_trip
  where active_trip.tag_id = tag.id
    and active_trip.status not in ('collected', 'archived_unconfirmed')
);
