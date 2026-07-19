import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlightStatus, journeyStatus } from "@/lib/aviationstack";
import { sendJourneyReminder } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });
  const now = new Date();
  const start = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: trips, error } = await supabase
    .from("tag_trips")
    .select("*, tags!inner(public_code, nickname, luggage_type, notification_email, notification_sms_phone, notify_by_email, notify_by_sms)")
    .in("status", ["submitted", "scheduled", "delayed", "in_flight", "landed"])
    .gte("flight_date", start)
    .lte("flight_date", end)
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let updated = 0; let reminded = 0; let archived = 0; const failures: string[] = [];
  for (const trip of trips ?? []) {
    try {
      let current = trip.status as string;
      if (current !== "landed") {
        const flight = await getFlightStatus({ flightNumber: trip.flight_number, flightDate: trip.flight_date, origin: trip.origin, destination: trip.destination });
        if (flight) {
          const next = journeyStatus(flight.providerStatus, flight.actualDeparture, flight.actualArrival);
          const changed = next !== current;
          const landingTime = flight.actualArrival || flight.scheduledArrival;
          await supabase.from("tag_trips").update({
            status: next,
            provider_flight_id: flight.providerFlightId,
            provider_status: flight.providerStatus,
            scheduled_departure: flight.scheduledDeparture,
            actual_departure: flight.actualDeparture,
            scheduled_arrival: flight.scheduledArrival,
            actual_arrival: flight.actualArrival,
            arrival_terminal: flight.arrivalTerminal,
            arrival_gate: flight.arrivalGate,
            baggage_claim: flight.baggageClaim,
            next_reminder_at: next === "landed" && !trip.next_reminder_at && landingTime ? new Date(new Date(landingTime).getTime() + 2 * 60 * 60 * 1000).toISOString() : trip.next_reminder_at,
            updated_at: now.toISOString(),
          }).eq("id", trip.id);
          if (changed) {
            const titles = { scheduled: "Flight scheduled", delayed: "Flight delayed", in_flight: "Flight departed — luggage expected in transit", landed: "Flight landed — awaiting luggage confirmation" };
            await supabase.from("trip_events").insert({ trip_id: trip.id, event_type: next, title: titles[next], detail: next === "in_flight" ? "Flight data indicates departure. Luggage presence is not independently verified." : `${trip.airline} ${trip.flight_number}`, source: "flight_provider" });
            updated++; current = next;
          }
        }
      }
      const arrival = trip.actual_arrival || trip.scheduled_arrival;
      if (current === "landed" && arrival && now.getTime() >= new Date(arrival).getTime() + 24 * 60 * 60 * 1000) {
        await supabase.from("tag_trips").update({ status: "archived_unconfirmed", archived_at: now.toISOString(), next_reminder_at: null, updated_at: now.toISOString() }).eq("id", trip.id);
        await supabase.from("trip_events").insert({ trip_id: trip.id, event_type: "archived_unconfirmed", title: "Journey archived — possession unconfirmed", detail: "The 24-hour confirmation window ended without an owner response. This journey can be restored at any time.", source: "automation" });
        archived++; continue;
      }
      if (current === "landed" && trip.next_reminder_at && new Date(trip.next_reminder_at) <= now) {
        const tag = trip.tags as { public_code: string; nickname: string | null; luggage_type: string | null; notification_email: string | null; notification_sms_phone: string | null; notify_by_email: boolean; notify_by_sms: boolean };
        const reminderNumber = trip.reminder_count + 1;
        const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://namtek-smart-tag.vercel.app";
        await sendJourneyReminder({ email: tag.notification_email, phone: tag.notification_sms_phone, emailEnabled: tag.notify_by_email, smsEnabled: tag.notify_by_sms, luggageName: tag.nickname || tag.luggage_type || "luggage", tagCode: tag.public_code, flightLabel: `${trip.airline} ${trip.flight_number}`, dashboardUrl: `${origin}/dashboard?tag=${tag.public_code}`, reminderNumber });
        await supabase.from("tag_trips").update({ reminder_count: reminderNumber, next_reminder_at: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), updated_at: now.toISOString() }).eq("id", trip.id);
        await supabase.from("trip_events").insert({ trip_id: trip.id, event_type: "reminder_sent", title: `Luggage confirmation reminder ${reminderNumber} sent`, source: "automation" });
        reminded++;
      }
    } catch (cause) { failures.push(`${trip.id}: ${cause instanceof Error ? cause.message : "Unknown error"}`); }
  }
  return NextResponse.json({ processed: trips?.length ?? 0, updated, reminded, archived, failures });
}
