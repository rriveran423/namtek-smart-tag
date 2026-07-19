import { AlertTriangle, BriefcaseMedical, CheckCircle2, Clock3, ExternalLink, Map, Phone, ShieldAlert } from "lucide-react";
import type { TagTrip, TravelTag } from "@/lib/types";
import { airlineSupport } from "@/lib/airline-support";
import { updateJourneyStatus } from "@/app/dashboard/actions";
import { ElapsedSince } from "@/components/elapsed-since";

const airportCode = (value: string) => value.match(/\(([A-Z]{3})\)/i)?.[1] || value.match(/\b([A-Z]{3})\b/i)?.[1] || "";

export function BaggagePickupAssistant({ trip, tag }: { trip: TagTrip; tag: TravelTag }) {
  if (!["landed", "lost"].includes(trip.status)) return null;
  const support = airlineSupport(trip.airline);
  const destinationCode = airportCode(trip.destination);
  const issue = trip.issue_type;
  const international = trip.origin.split(",").at(-1)?.trim() !== trip.destination.split(",").at(-1)?.trim();
  return (
    <section className="mt-5 overflow-hidden rounded-[24px] border border-[#dfe4eb] bg-white">
      <div className="bg-gradient-to-r from-[#14233b] to-[#1c3c5e] p-5 text-white sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#7bdef4]">Baggage pickup assistant</p>
        <h3 className="display mt-2 text-2xl font-extrabold">{issue ? (issue === "damaged" ? "Damaged luggage help" : "Missing luggage help") : `Collect your luggage at ${destinationCode || "your destination"}`}</h3>
        <p className="mt-2 text-sm text-white/55">Live airline data can change. Always confirm terminal, gate, and carousel on the airport display screens.</p>
      </div>
      {!issue ? (
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f4f7fb] p-4"><p className="text-xs font-bold uppercase tracking-wider text-black/35">Arrival terminal</p><p className="mt-2 text-xl font-extrabold">{trip.arrival_terminal || "Check airport screens"}</p></div>
            <div className="rounded-2xl bg-[#f4f7fb] p-4"><p className="text-xs font-bold uppercase tracking-wider text-black/35">Arrival gate</p><p className="mt-2 text-xl font-extrabold">{trip.arrival_gate || "Not provided"}</p></div>
            <div className="rounded-2xl bg-[#eef4ff] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#2463eb]">Baggage carousel</p><p className="mt-2 text-xl font-extrabold text-[#163f91]">{trip.baggage_claim || "Check airport screens"}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-black/50">
            {trip.actual_arrival && <span className="rounded-full bg-[#f4f7fb] px-3 py-2">Reported arrival: {new Date(trip.actual_arrival).toLocaleString()}</span>}
            {trip.actual_arrival && <ElapsedSince date={trip.actual_arrival} />}
            {international && <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-800">International arrival: follow customs instructions before exiting</span>}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e1e6ed] p-4"><p className="font-bold">Your luggage identification</p><p className="mt-2 text-sm text-black/50">{tag.nickname || tag.luggage_type || "My luggage"} · {tag.luggage_color || "Color not entered"} · {tag.luggage_brand || "Brand not entered"}</p><p className="mt-2 text-sm text-black/50">Airline bag tag: <strong>{trip.airline_bag_tag_number || "Not entered"}</strong> · Checked bags: <strong>{trip.checked_bag_count}</strong></p></div>
            <div className="grid gap-2"><a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${trip.destination} baggage claim`)}`} className="flex items-center justify-center gap-2 rounded-2xl border border-[#dfe4eb] p-4 font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"><Map size={18} /> Open destination airport map <ExternalLink size={14} /></a><a target="_blank" href={`https://www.google.com/search?q=${encodeURIComponent(`${destinationCode} official airport terminal map baggage claim`)}`} className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[#2463eb]">Find official terminal map <ExternalLink size={12} /></a></div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <form action={updateJourneyStatus}><input type="hidden" name="trip_id" value={trip.id} /><input type="hidden" name="tag_code" value={tag.public_code} /><input type="hidden" name="journey_action" value="collected" /><button className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><CheckCircle2 size={16} /> I have my luggage</button></form>
            <form action={updateJourneyStatus}><input type="hidden" name="trip_id" value={trip.id} /><input type="hidden" name="tag_code" value={tag.public_code} /><input type="hidden" name="journey_action" value="lost" /><button className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><ShieldAlert size={16} /> Luggage is missing</button></form>
            <form action={updateJourneyStatus}><input type="hidden" name="trip_id" value={trip.id} /><input type="hidden" name="tag_code" value={tag.public_code} /><input type="hidden" name="journey_action" value="damaged" /><button className="flex w-full items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800"><BriefcaseMedical size={16} /> Luggage is damaged</button></form>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
          <div><h4 className="flex items-center gap-2 font-extrabold"><AlertTriangle className="text-[#ff5a36]" size={19} /> Before leaving the airport</h4><ol className="mt-4 space-y-3 text-sm leading-6 text-black/60"><li><strong className="text-black">1.</strong> Check the assigned and oversized-baggage carousels.</li><li><strong className="text-black">2.</strong> Go to the airline baggage service desk in the arrival area.</li><li><strong className="text-black">3.</strong> File a Property Irregularity Report and save the PIR number.</li><li><strong className="text-black">4.</strong> Keep baggage tags, photos, receipts, and any written airline instructions.</li>{issue === "damaged" && <li><strong className="text-black">5.</strong> Photograph all damage before the bag is repaired, discarded, or removed from the airport.</li>}</ol></div>
          <aside className="rounded-2xl bg-[#f4f7fb] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#2463eb]">Official airline assistance</p><h4 className="mt-2 text-lg font-extrabold">{support.label}</h4>{support.phone && <a href={`tel:${support.phone.replace(/[^+\d]/g, "")}`} className="mt-4 flex items-center gap-2 font-bold text-[#2463eb]"><Phone size={17} /> {support.phone}</a>}<p className="mt-3 flex items-start gap-2 text-xs leading-5 text-black/45"><Clock3 className="mt-0.5 shrink-0" size={14} /> {support.hours}</p><a target="_blank" href={support.baggageUrl} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#0f1726] px-4 py-3 text-sm font-bold text-white">Open baggage support <ExternalLink size={14} /></a><p className="mt-3 text-[11px] leading-5 text-black/40">Contact details can change. Confirm current information on the linked official airline page.</p></aside>
        </div>
      )}
    </section>
  );
}
