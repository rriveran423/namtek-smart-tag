import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "Missing trip" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: trip } = await supabase.from("tag_trips").select("status, updated_at, reminder_count").eq("id", tripId).eq("owner_id", user.id).single();
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: event } = await supabase.from("trip_events").select("id").eq("trip_id", tripId).order("event_at", { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json({ marker: `${trip.status}:${trip.updated_at}:${trip.reminder_count}:${event?.id ?? 0}` });
}
