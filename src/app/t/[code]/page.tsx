import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  Heart,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LocationShare } from "@/components/location-share";
import { createClient } from "@/lib/supabase/server";
import type { TravelTag } from "@/lib/types";

type AirportDetails = { city: string; name: string; code: string; country: string };

function parseAirport(value: string | null): AirportDetails {
  if (!value) return { city: "Not specified", name: "", code: "—", country: "" };
  const match = value.match(/^(.+?) — (.+) \(([A-Z0-9]{3,4})\), (.+)$/);
  if (!match) return { city: value, name: "", code: "", country: "" };
  return { city: match[1], name: match[2], code: match[3], country: match[4] };
}

function Airport({ value, direction }: { value: string | null; direction: "FROM" | "TO" }) {
  const airport = parseAirport(value);
  return (
    <div className="min-w-0 flex-1">
      <div className={`flex items-center gap-3 ${direction === "TO" ? "sm:flex-row-reverse" : ""}`}>
        {airport.code && (
          <span className="shrink-0 rounded-xl bg-[#2463eb] px-3 py-2 text-lg font-extrabold tracking-wide text-white">
            {airport.code}
          </span>
        )}
        <div className={`min-w-0 ${direction === "TO" ? "sm:text-right" : ""}`}>
          <p className="text-[11px] font-bold tracking-[.14em] text-black/40">{direction}</p>
          <p className="mt-0.5 text-lg font-extrabold leading-tight">{airport.city}</p>
        </div>
      </div>
      {(airport.name || airport.country) && (
        <p className={`mt-3 text-sm leading-5 text-black/55 ${direction === "TO" ? "sm:text-right" : ""}`}>
          {airport.name}{airport.name && airport.country ? " · " : ""}{airport.country}
        </p>
      )}
    </div>
  );
}

function Stop({ value, number }: { value: string; number: number }) {
  const airport = parseAirport(value);
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8ff62] text-xs font-extrabold">
        {number}
      </span>
      <div className="min-w-0">
        <p className="font-bold leading-5">
          {airport.city}{airport.code ? ` (${airport.code})` : ""}
        </p>
        {(airport.name || airport.country) && (
          <p className="mt-1 text-xs leading-5 text-black/50">
            {airport.name}{airport.name && airport.country ? " · " : ""}{airport.country}
          </p>
        )}
      </div>
    </div>
  );
}

async function getTag(code: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_tag", { tag_code: code });
  return (data?.[0] as TravelTag | undefined) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const tag = await getTag(code);
  return {
    title: tag ? `Found luggage · ${tag.traveler_name ?? "NamTek traveler"}` : "Travel tag not found",
    description: "Help reunite this luggage with its owner.",
  };
}

export default async function FinderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const tag = await getTag(code);
  if (!tag) notFound();
  const firstName = tag.traveler_name?.split(" ")[0] ?? "the owner";
  const TripIcon = tag.trip_type === "business" ? BriefcaseBusiness : tag.trip_type === "emergency" ? Siren : Heart;

  return (
    <main className="grid-bg min-h-screen px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[600px]">
        <div className="mb-5 flex items-center justify-between px-2">
          <Brand />
          <span className="flex items-center gap-1.5 text-xs font-bold text-black/45"><ShieldCheck size={14} /> VERIFIED TRAVEL TAG</span>
        </div>
        <article className="card-shadow overflow-hidden rounded-[34px] border border-black/10 bg-white">
          <header className={`relative overflow-hidden px-6 py-9 text-white sm:px-9 ${tag.status === "lost" ? "bg-[#ff5a36]" : "bg-[#2463eb]"}`}>
            {tag.traveler_photo_url && <img src={tag.traveler_photo_url} alt={tag.traveler_name ?? "Traveler"} className="mb-5 h-24 w-24 rounded-full border-4 border-white/80 object-cover" />}
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">NamTek Smart Tag · {tag.public_code}</p>
            <h1 className="display mt-4 text-4xl font-extrabold leading-tight">You found {firstName}&apos;s luggage.</h1>
            <p className="mt-4 max-w-md leading-7 text-white/80">{tag.finder_message}</p>
          </header>
          <div className="space-y-5 p-6 sm:p-9">
            {tag.bag_photo_url && (
              <section className="overflow-hidden rounded-3xl border border-black/10">
                <img src={tag.bag_photo_url} alt={`${tag.luggage_color ?? ""} ${tag.luggage_type ?? "luggage"}`} className="aspect-[4/3] w-full object-cover" />
                <div className="p-5">
                  <p className="font-bold">{tag.nickname || tag.luggage_type || "Traveler’s luggage"}</p>
                  <p className="mt-1 text-sm text-black/50">{[tag.luggage_color, tag.luggage_brand, tag.luggage_type].filter(Boolean).join(" · ")}</p>
                  {tag.luggage_notes && <p className="mt-3 text-sm leading-6 text-black/65">{tag.luggage_notes}</p>}
                </div>
              </section>
            )}
            {(tag.airline || tag.route_origin || tag.route_destination) && (
              <section className="rounded-3xl bg-[#eef4ff] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold text-[#2454a6]"><Plane size={18} />{tag.airline || "Travel route"}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold capitalize"><TripIcon size={14} />{tag.trip_type}</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <Airport value={tag.route_origin} direction="FROM" />
                  <div className="hidden items-center sm:flex"><span className="h-px w-3 bg-[#2463eb]/25" /><Plane className="mx-1 shrink-0 text-[#2463eb]" size={22} /><span className="h-px w-3 bg-[#2463eb]/25" /></div>
                  <div className="flex items-center gap-2 sm:hidden"><span className="h-5 w-px bg-[#2463eb]/30" /><Plane className="rotate-90 text-[#2463eb]" size={18} /></div>
                  <Airport value={tag.route_destination} direction="TO" />
                </div>
                {tag.route_stops?.length > 0 && (
                  <div className="mt-5 border-t border-[#2463eb]/15 pt-5">
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-[.12em] text-black/40"><MapPin size={13} /> CONNECTIONS</p>
                    <div className="grid gap-2">{tag.route_stops.map((stop, index) => <Stop key={stop} value={stop} number={index + 1} />)}</div>
                  </div>
                )}
              </section>
            )}
            <LocationShare code={tag.public_code} />
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[.14em] text-black/40">Contact the owner</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tag.public_phone && <><a href={`tel:${tag.public_phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#d8ff62] px-4 py-4 font-bold"><Phone size={18} /> Call</a><a href={`sms:${tag.public_phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-4 font-bold"><MessageCircle size={18} /> Text</a></>}
                {tag.public_email && <a href={`mailto:${tag.public_email}?subject=I found your NamTek luggage`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-4 font-bold sm:col-span-2"><Mail size={18} /> Email owner</a>}
              </div>
            </section>
            {tag.alternate_phone && <section className="rounded-2xl border border-black/10 p-5"><p className="text-sm text-black/50">Alternate contact</p><a href={`tel:${tag.alternate_phone}`} className="mt-1 flex items-center justify-between font-bold"><span>{tag.alternate_name ?? "Emergency contact"}</span><Phone size={17} /></a></section>}
            {tag.reward_message && <p className="rounded-2xl bg-[#fff1ed] p-5 text-sm font-bold text-[#a53019]">{tag.reward_message}</p>}
            <p className="flex items-center justify-center gap-2 text-xs text-black/40"><Languages size={14} /> Preferred language: {tag.preferred_language}</p>
          </div>
        </article>
        <p className="mt-6 text-center text-xs text-black/40">Please never share this traveler&apos;s information publicly.</p>
      </div>
    </main>
  );
}
