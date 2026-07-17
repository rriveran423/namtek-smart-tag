/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import {
  ExternalLink,
  FileCheck2,
  Luggage,
  MapPin,
  Plane,
  Radar,
  Route,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";

type Packet = {
  tag: {
    public_code: string;
    traveler_name: string | null;
    nickname: string | null;
    luggage_type: string | null;
    luggage_brand: string | null;
    luggage_color: string | null;
    luggage_notes: string | null;
    bag_photo_url: string | null;
    airline: string | null;
    flight_number: string | null;
    baggage_report_number: string | null;
    route_origin: string | null;
    route_destination: string | null;
    route_stops: string[];
    tracker_type: string | null;
    tracker_url: string | null;
    status: string;
  };
  scans: {
    latitude: number;
    longitude: number;
    accuracy_m: number | null;
    created_at: string;
  }[];
  handoffs: {
    handoff_type: string;
    handoff_location: string | null;
    status: string;
    created_at: string;
  }[];
};

export default async function RecoveryPacketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_recovery_packet", {
    packet_code: code,
  });
  const packet = data as Packet | null;
  if (!packet) notFound();
  const { tag } = packet;
  return (
    <main className="min-h-screen bg-[#eef4ff] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Brand />
          <span className="flex items-center gap-2 rounded-full bg-[#d8ff62] px-4 py-2 text-xs font-extrabold">
            <FileCheck2 size={15} /> SECURE RECOVERY PACKET
          </span>
        </header>
        <section className="mt-6 overflow-hidden rounded-[32px] bg-white shadow-xl shadow-[#2454a6]/10">
          <div className="bg-[#2463eb] p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">
              NamTek Smart Tag · {tag.public_code}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold">
              Airline luggage recovery packet
            </h1>
            <p className="mt-2 text-white/70">
              Prepared for authorized airline and recovery personnel.
            </p>
          </div>
          <div className="grid gap-6 p-6 sm:p-9 lg:grid-cols-2">
            {tag.bag_photo_url && (
              <img
                src={tag.bag_photo_url}
                alt="Missing luggage"
                className="aspect-[4/3] w-full rounded-3xl object-cover"
              />
            )}
            <section className="rounded-3xl bg-[#f7f4ec] p-6">
              <div className="flex items-center gap-3">
                <Luggage className="text-[#ff5a36]" />
                <h2 className="text-xl font-extrabold">
                  {tag.nickname || tag.luggage_type || "Missing luggage"}
                </h2>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-black/45">Traveler</dt>
                  <dd className="font-bold">
                    {tag.traveler_name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-black/45">Status</dt>
                  <dd className="font-bold capitalize">{tag.status}</dd>
                </div>
                <div>
                  <dt className="text-black/45">Type</dt>
                  <dd className="font-bold">{tag.luggage_type || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/45">Color / brand</dt>
                  <dd className="font-bold">
                    {[tag.luggage_color, tag.luggage_brand]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </dd>
                </div>
              </dl>
              {tag.luggage_notes && (
                <p className="mt-5 border-t border-black/10 pt-4 text-sm leading-6">
                  {tag.luggage_notes}
                </p>
              )}
            </section>
            <section className="rounded-3xl bg-[#eef4ff] p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <Route className="text-[#2463eb]" />
                <h2 className="text-xl font-extrabold">Itinerary and claim</h2>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-black/45">AIRLINE / FLIGHT</p>
                  <p className="mt-1 font-bold">
                    {tag.airline || "—"}
                    {tag.flight_number ? ` · ${tag.flight_number}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/45">ROUTE</p>
                  <p className="mt-1 font-bold">
                    {tag.route_origin || "—"} → {tag.route_destination || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/45">BAGGAGE REPORT / PIR</p>
                  <p className="mt-1 font-bold">
                    {tag.baggage_report_number || "Not provided"}
                  </p>
                </div>
              </div>
              {tag.route_stops?.length > 0 && (
                <p className="mt-4 text-sm text-black/55">
                  Connections: {tag.route_stops.join(" · ")}
                </p>
              )}
            </section>
            {tag.tracker_url && (
              <a
                href={tag.tracker_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-3xl bg-[#171713] p-6 text-white"
              >
                <span className="flex items-center gap-3">
                  <Radar className="text-[#d8ff62]" />
                  <span>
                    <span className="block text-xs text-white/45">
                      TEMPORARY TRACKER LINK
                    </span>
                    <span className="mt-1 block font-bold">
                      Open{" "}
                      {tag.tracker_type?.replaceAll("_", " ") ||
                        "shared tracker"}
                    </span>
                  </span>
                </span>
                <ExternalLink />
              </a>
            )}
            <section className="rounded-3xl border border-black/10 p-6">
              <h2 className="font-extrabold">Finder handoff timeline</h2>
              <div className="mt-4 space-y-3">
                {packet.handoffs.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 border-t border-black/10 pt-3"
                  >
                    <MapPin className="shrink-0 text-[#ff5a36]" size={17} />
                    <div>
                      <p className="text-sm font-bold capitalize">
                        {item.handoff_type.replaceAll("_", " ")} ·{" "}
                        {item.status.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-black/45">
                        {item.handoff_location || "Location not provided"} ·{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {packet.handoffs.length === 0 && (
                  <p className="text-sm text-black/40">
                    No finder handoffs reported.
                  </p>
                )}
              </div>
            </section>
            <section className="rounded-3xl border border-black/10 p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <Plane className="text-[#2463eb]" />
                <h2 className="text-xl font-extrabold">
                  Last known QR scan locations
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {packet.scans.map((scan, index) => (
                  <a
                    key={index}
                    target="_blank"
                    href={`https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`}
                    className="flex items-center justify-between rounded-2xl bg-[#f7f4ec] p-4 text-sm"
                  >
                    <span>
                      <span className="block font-bold">
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                      <span className="text-xs text-black/45">
                        {scan.latitude.toFixed(5)}, {scan.longitude.toFixed(5)}
                        {scan.accuracy_m
                          ? ` · ±${Math.round(scan.accuracy_m)}m`
                          : ""}
                      </span>
                    </span>
                    <ExternalLink size={15} />
                  </a>
                ))}
                {packet.scans.length === 0 && (
                  <p className="text-sm text-black/40">
                    No location has been shared yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
        <p className="mt-5 text-center text-xs text-black/40">
          Confidential recovery information. The owner can disable this link at
          any time.
        </p>
      </div>
    </main>
  );
}
