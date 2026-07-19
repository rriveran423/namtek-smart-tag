import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, History, Luggage, Plane, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import type { TripEvent } from "@/lib/types";
import { updateJourneyStatus } from "../actions";

type HistoricalTrip = {
  id: string;
  airline: string;
  flight_number: string;
  flight_date: string;
  origin: string;
  destination: string;
  status: "collected" | "archived_unconfirmed";
  provider_status: string | null;
  actual_departure: string | null;
  actual_arrival: string | null;
  completed_at: string | null;
  archived_at: string | null;
  tags: { public_code: string; nickname: string | null; luggage_type: string | null };
  trip_events: TripEvent[];
};

export const dynamic = "force-dynamic";

export default async function JourneyHistory({ searchParams }: { searchParams: Promise<{ completed?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Fhistory");
  const { data } = await supabase
    .from("tag_trips")
    .select("*, tags!inner(public_code, nickname, luggage_type), trip_events(*)")
    .eq("owner_id", user.id)
    .in("status", ["collected", "archived_unconfirmed"])
    .order("created_at", { ascending: false });
  const trips = (data ?? []) as unknown as HistoricalTrip[];
  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#121826]">
      <nav className="flex items-center justify-between border-b border-white/10 bg-[#0f1726] px-6 py-4 lg:px-10">
        <Brand inverse />
        <Link href="/dashboard" className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"><ArrowLeft size={15} /> Dashboard</Link>
      </nav>
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6 sm:py-12">
        {params.completed && <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#d8ff62] p-4 font-bold"><CheckCircle2 size={20} /> Luggage confirmed. The completed trip is now preserved in your journey history.</div>}
        <header className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#111b2e] via-[#14233b] to-[#183654] p-7 text-white shadow-xl sm:p-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#1dc8ee]/10 blur-3xl" />
          <div className="relative"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7bdef4]">Permanent travel record</p><h1 className="display mt-3 text-4xl font-extrabold sm:text-5xl">Journey history</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Review every completed or unconfirmed luggage journey and expand it for a timestamped record of customer actions, flight statuses, reminders, and recovery events.</p></div>
        </header>
        {trips.length === 0 ? (
          <section className="mt-6 rounded-[28px] bg-white p-10 text-center shadow-sm"><History className="mx-auto text-[#2463eb]" size={40} /><h2 className="display mt-4 text-2xl font-extrabold">No completed journeys yet</h2><p className="mt-2 text-sm text-black/45">Trips appear here automatically after luggage possession is confirmed or the confirmation window expires.</p></section>
        ) : (
          <div className="mt-6 space-y-4">
            {trips.map((trip) => {
              const events = [...(trip.trip_events ?? [])].sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());
              const luggageName = trip.tags.nickname || trip.tags.luggage_type || "My luggage";
              return (
                <details key={trip.id} className="group overflow-hidden rounded-[26px] border border-[#dfe4eb] bg-white shadow-sm open:shadow-lg">
                  <summary className="cursor-pointer list-none p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eefc] text-[#2463eb]"><Luggage size={22} /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-black/35">{luggageName} · {trip.tags.public_code}</p><h2 className="mt-1 text-xl font-extrabold">{trip.airline} {trip.flight_number}</h2><p className="mt-1 text-sm text-black/45">{trip.origin} → {trip.destination} · {new Date(`${trip.flight_date}T12:00:00`).toLocaleDateString()}</p></div></div>
                      <div className="flex items-center gap-3"><span className={`rounded-full px-4 py-2 text-xs font-extrabold ${trip.status === "collected" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{trip.status === "collected" ? "Luggage confirmed" : "Possession unconfirmed"}</span><span className="text-xl text-black/35 transition group-open:rotate-180">⌄</span></div>
                    </div>
                  </summary>
                  <div className="border-t border-[#e7ebf0] bg-[#fbfcfe] p-5 sm:p-7">
                    <div className="grid gap-5 lg:grid-cols-[.65fr_1.35fr]">
                      <aside className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                        <h3 className="flex items-center gap-2 font-bold"><Plane size={17} /> Flight record</h3>
                        <p className="text-sm text-black/50">Provider status: <strong className="capitalize text-black/75">{trip.provider_status || "Not recorded"}</strong></p>
                        <p className="text-sm text-black/50">Departure: <strong className="text-black/75">{trip.actual_departure ? new Date(trip.actual_departure).toLocaleString() : "Not recorded"}</strong></p>
                        <p className="text-sm text-black/50">Arrival: <strong className="text-black/75">{trip.actual_arrival ? new Date(trip.actual_arrival).toLocaleString() : "Not recorded"}</strong></p>
                        {trip.status === "archived_unconfirmed" && <form action={updateJourneyStatus} className="pt-3"><input type="hidden" name="trip_id" value={trip.id} /><input type="hidden" name="tag_code" value={trip.tags.public_code} /><input type="hidden" name="journey_action" value="restore" /><button className="flex w-full items-center justify-center gap-2 rounded-full border border-[#dfe4eb] px-4 py-3 text-sm font-bold"><RotateCcw size={15} /> Restore journey</button></form>}
                      </aside>
                      <section><h3 className="flex items-center gap-2 font-bold"><Clock3 size={17} /> Timestamped audit trail</h3><div className="mt-5">{events.map((event, index) => <div key={event.id} className="relative border-l-2 border-[#dce3ee] pb-6 pl-6 last:pb-0"><span className={`absolute -left-[6px] top-1 h-2.5 w-2.5 rounded-full ${index === events.length - 1 ? "bg-[#ff5a36]" : "bg-[#2463eb]"}`} /><p className="text-sm font-bold">{event.title}</p>{event.detail && <p className="mt-1 text-xs leading-5 text-black/45">{event.detail}</p>}<p className="mt-2 text-[11px] font-medium uppercase tracking-[.08em] text-black/35">{new Date(event.event_at).toLocaleString()} · {event.source.replaceAll("_", " ")}</p></div>)}</div></section>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
