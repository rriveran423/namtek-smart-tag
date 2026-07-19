import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Clock3,
  ExternalLink,
  Heart,
  History,
  LocateFixed,
  Luggage,
  MapPinned,
  PackageCheck,
  Pencil,
  Plane,
  Plus,
  Save,
  Siren,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { AirportSearch, AirportStops } from "@/components/airport-search";
import { AirlineSearch } from "@/components/airline-search";
import { ImageUpload } from "@/components/image-upload";
import { RecoveryCenter } from "@/components/recovery-center";
import { DashboardPanel } from "@/components/dashboard-panel";
import { JourneyLiveRefresh } from "@/components/journey-live-refresh";
import { BaggagePickupAssistant } from "@/components/baggage-pickup-assistant";
import { createClient } from "@/lib/supabase/server";
import type { TravelTag } from "@/lib/types";
import {
  renameTag,
  signOut,
  startLuggageJourney,
  updateTag,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    claimed?: string;
    error?: string;
    tag?: string;
    renamed?: string;
    journey?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("tags")
    .select("*, tag_scans(*), recovery_cases(*, recovery_messages(*)), tag_trips(*, trip_events(*))")
    .eq("owner_id", user.id)
    .order("created_at", { referencedTable: "tag_scans", ascending: false });
  const tags = (data ?? []) as TravelTag[];
  const tag = tags.find((item) => item.public_code === params.tag) ?? tags[0];
  const latest = tag?.tag_scans?.[0];
  const trips = [...(tag?.tag_trips ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const activeTrip = trips.find((trip) => !["collected", "archived_unconfirmed"].includes(trip.status));
  const hasFlightInfo = Boolean(tag?.airline && tag.flight_number && tag.flight_date && tag.route_origin && tag.route_destination);
  const field =
    "mt-2 w-full rounded-2xl border border-[#d8dee8] bg-[#fbfcfe] px-4 py-3.5 text-[#111827] outline-none transition focus:border-[#2463eb] focus:bg-white focus:ring-4 focus:ring-[#2463eb]/10";
  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#121826]">
      <nav className="flex items-center justify-between border-b border-white/10 bg-[#0f1726] px-6 py-4 lg:px-10">
        <Brand inverse />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-white/55 sm:block">
            {user.email}
          </span>
          <form action={signOut}>
            <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      {tag && (
        <nav className="sticky top-0 z-40 border-b border-[#dfe4eb] bg-white/90 px-6 py-3 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
            <a
              href="#luggage"
              className="whitespace-nowrap rounded-full bg-[#0f1726] px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Luggage
            </a>
            <a
              href="#trip"
              className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"
            >
              Trip
            </a>
            {(hasFlightInfo || activeTrip) && <a href="#journey" className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]">Journey</a>}
            <Link href="/dashboard/history" className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]">History</Link>
            <a
              href="#recovery-tools"
              className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"
            >
              Recovery tools
            </a>
            <a
              href="#finder-preferences"
              className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"
            >
              Finder page
            </a>
            <a
              href="#recovery-center"
              className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"
            >
              Messages
            </a>
            <a
              href="#locations"
              className="whitespace-nowrap rounded-full border border-[#dfe4eb] bg-white px-4 py-2 text-xs font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"
            >
              Locations
            </a>
          </div>
        </nav>
      )}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="relative mb-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#111b2e] via-[#14233b] to-[#183654] p-7 text-white shadow-xl shadow-[#12233b]/10 sm:p-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#1dc8ee]/10 blur-3xl" />
          <div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-[#ff6a32]/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#7bdef4]">
                Traveler dashboard
              </p>
              <h1 className="display mt-3 text-4xl font-extrabold sm:text-5xl">
                Your journeys
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Manage your luggage identity, travel details, recovery tools,
                and finder conversations in one place.
              </p>
            </div>
            {tag && (
              <Link
                target="_blank"
                href={`/t/${tag.public_code}`}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-bold text-[#111827] shadow-lg transition hover:-translate-y-0.5"
              >
                View finder page <ExternalLink size={15} />
              </Link>
            )}
          </div>
        </div>
        {params.saved && (
          <div className="mb-6 rounded-xl bg-[#d8ff62] p-4 font-bold">
            Travel tag updated.
          </div>
        )}
        {params.claimed && (
          <div className="mb-6 rounded-xl bg-[#d8ff62] p-4 font-bold">
            Tag {params.claimed} is now registered to your account.
          </div>
        )}
        {params.renamed && (
          <div className="mb-6 rounded-xl bg-[#d8ff62] p-4 font-bold">
            Luggage name updated.
          </div>
        )}
        {params.journey && (
          <div className="mb-6 rounded-xl bg-[#d8ff62] p-4 font-bold">
            Luggage journey updated.
          </div>
        )}
        {params.error && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-800">
            {params.error}
          </div>
        )}
        {!tag ? (
          <section className="rounded-[32px] bg-white p-8 text-center sm:p-14">
            <PackageCheck className="mx-auto text-[#ff5a36]" size={46} />
            <h2 className="display mt-5 text-3xl font-extrabold">
              Activate your first Smart Tag
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-black/55">
              Scan the private registration QR included inside your NamTek
              package.
            </p>
            <Link
              href="/dashboard/add-tag"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0f1726] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#18243a]"
            >
              <Plus size={17} /> Add your first tag
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-7 flex gap-3 overflow-x-auto pb-2">
              {tags.map((item) => (
                <Link
                  href={`/dashboard?tag=${item.public_code}`}
                  key={item.id}
                  className={`min-w-[225px] rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.id === tag.id ? "border-[#2463eb] bg-white ring-4 ring-[#2463eb]/5" : "border-[#dfe4eb] bg-white/70"}`}
                >
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-black/40">
                    {item.public_code}
                  </p>
                  <p className="mt-1 font-bold">
                    {item.nickname || item.luggage_type || "My luggage"}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs capitalize text-black/45">
                    <span
                      className={`h-2 w-2 rounded-full ${item.status === "lost" ? "bg-[#ff5a36]" : "bg-emerald-500"}`}
                    />
                    {item.trip_type} · {item.status}
                  </p>
                </Link>
              ))}
              <Link
                href="/dashboard/add-tag"
                className="flex min-w-[210px] items-center justify-center gap-3 rounded-2xl border border-dashed border-[#aeb8c7] bg-white/45 p-4 text-sm font-bold text-[#334155] transition hover:-translate-y-0.5 hover:border-[#2463eb] hover:bg-white hover:text-[#2463eb] hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8eefc] text-[#2463eb]">
                  <Plus size={18} />
                </span>
                Add another tag
              </Link>
            </div>
            <section className="mb-6 flex flex-col gap-5 rounded-[24px] border border-[#dfe4eb] bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2463eb]">
                  Selected luggage
                </p>
                <h2 className="display mt-2 text-2xl font-extrabold">
                  {tag.nickname || tag.luggage_type || "My luggage"}
                </h2>
                <p className="mt-1 text-xs text-black/40">
                  Smart Tag {tag.public_code}
                </p>
              </div>
              <form
                action={renameTag}
                className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
              >
                <input type="hidden" name="id" value={tag.id} />
                <input
                  type="hidden"
                  name="public_code"
                  value={tag.public_code}
                />
                <label className="sr-only" htmlFor="quick-luggage-name">
                  Luggage name
                </label>
                <input
                  id="quick-luggage-name"
                  name="nickname"
                  required
                  maxLength={60}
                  defaultValue={tag.nickname ?? ""}
                  placeholder="For example: Blue Away suitcase"
                  className="min-w-0 flex-1 rounded-full border border-[#d8dee8] bg-[#fbfcfe] px-4 py-3 text-sm outline-none transition focus:border-[#2463eb] focus:bg-white focus:ring-4 focus:ring-[#2463eb]/10"
                />
                <button className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0f1726] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#18243a]">
                  <Pencil size={15} /> Rename
                </button>
              </form>
            </section>
            {(hasFlightInfo || activeTrip) && <section id="journey" className="mb-6 scroll-mt-28 rounded-[28px] border border-[#dfe4eb] bg-white p-6 shadow-sm sm:p-7">
              {activeTrip && <JourneyLiveRefresh tripId={activeTrip.id} />}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8eefc] text-[#2463eb]"><Plane size={21} /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2463eb]">Luggage journey</p>
                    <h2 className="display mt-1 text-2xl font-extrabold">{activeTrip ? "Active flight tracking" : "Start a tracked trip"}</h2>
                  </div>
                </div>
                {activeTrip && <span className="rounded-full bg-[#fff0e9] px-4 py-2 text-xs font-extrabold capitalize text-[#d94727]">{activeTrip.status.replaceAll("_", " ")}</span>}
              </div>
              {activeTrip ? (
                <>
                <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
                  <div className="rounded-2xl bg-[#f4f7fb] p-5">
                    <p className="text-xl font-extrabold">{activeTrip.airline} {activeTrip.flight_number}</p>
                    <p className="mt-1 text-sm text-black/50">{activeTrip.origin} → {activeTrip.destination}</p>
                    <p className="mt-1 text-sm text-black/50">{new Date(`${activeTrip.flight_date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    {activeTrip.status === "in_flight" && <p className="mt-4 rounded-xl bg-amber-100 p-3 text-xs leading-5 text-amber-900">The flight has departed and the luggage is expected in transit. NamTek cannot independently verify that it was loaded.</p>}
                    {activeTrip.status === "landed" && <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#eef4ff] p-3 text-xs leading-5 text-[#2454a6]"><Clock3 className="mt-0.5 shrink-0" size={15} /> Flight landed. Please confirm whether your luggage is back with you.</p>}
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 font-bold"><History size={17} /> Journey audit trail</h3>
                    <div className="mt-4 max-h-72 space-y-0 overflow-y-auto pr-2">
                      {[...(activeTrip.trip_events ?? [])].sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime()).map((event) => (
                        <div key={event.id} className="relative border-l-2 border-[#dce3ee] pb-5 pl-5 last:pb-0">
                          <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#2463eb]" />
                          <p className="text-sm font-bold">{event.title}</p>
                          {event.detail && <p className="mt-1 text-xs leading-5 text-black/45">{event.detail}</p>}
                          <p className="mt-1 text-[11px] text-black/35">{new Date(event.event_at).toLocaleString()} · {event.source.replaceAll("_", " ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <BaggagePickupAssistant trip={activeTrip} tag={tag} />
                </>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#f4f7fb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                  <div><p className="font-bold">Ready to check your luggage?</p><p className="mt-1 text-sm leading-6 text-black/45">First save the airline, flight number, travel date, origin and destination below. Then confirm when you hand the bag to the airline.</p></div>
                  <form action={startLuggageJourney} className="mt-4 shrink-0 sm:mt-0"><input type="hidden" name="tag_id" value={tag.id} /><button className="rounded-full bg-[#0f1726] px-5 py-3 text-sm font-bold text-white">Luggage submitted to airline</button></form>
                </div>
              )}
              <Link href="/dashboard/history" className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#dfe4eb] px-4 py-3 text-sm font-bold transition hover:border-[#2463eb] hover:text-[#2463eb]"><History size={16} /> Open complete journey history</Link>
            </section>}
            <div className="grid items-start gap-6 xl:grid-cols-[1.45fr_.55fr]">
              <form action={updateTag} className="space-y-4">
                <input type="hidden" name="id" value={tag.id} />
                <DashboardPanel
                  id="luggage"
                  title={tag.nickname || tag.luggage_type || "My luggage"}
                  subtitle="Luggage and traveler identity"
                  icon={<Luggage size={21} />}
                  defaultOpen
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <ImageUpload
                      tagId={tag.id}
                      kind="bag"
                      currentUrl={tag.bag_photo_url}
                    />
                    <ImageUpload
                      tagId={tag.id}
                      kind="traveler"
                      currentUrl={tag.traveler_photo_url}
                      circular
                    />
                    <label className="flex items-center gap-2 text-sm font-bold">
                      <input
                        type="checkbox"
                        name="show_bag_photo"
                        defaultChecked={tag.show_bag_photo}
                        className="accent-[#ff5a36]"
                      />{" "}
                      Show luggage photo to finder
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                      <input
                        type="checkbox"
                        name="show_traveler_photo"
                        defaultChecked={tag.show_traveler_photo}
                        className="accent-[#ff5a36]"
                      />{" "}
                      Show traveler photo to finder
                    </label>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-bold">
                      Luggage name
                      <input
                        name="nickname"
                        defaultValue={tag.nickname ?? ""}
                        className={field}
                        placeholder="Blue checked suitcase"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Traveler name
                      <input
                        required
                        name="traveler_name"
                        defaultValue={tag.traveler_name ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Luggage type
                      <select
                        name="luggage_type"
                        defaultValue={tag.luggage_type ?? ""}
                        className={field}
                      >
                        <option value="">Select type</option>
                        <option>Checked suitcase</option>
                        <option>Carry-on</option>
                        <option>Backpack</option>
                        <option>Garment bag</option>
                        <option>Equipment case</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="text-sm font-bold">
                      Brand
                      <input
                        name="luggage_brand"
                        defaultValue={tag.luggage_brand ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Color
                      <input
                        name="luggage_color"
                        defaultValue={tag.luggage_color ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Tag status
                      <select
                        name="status"
                        defaultValue={tag.status}
                        className={field}
                      >
                        <option value="active">Active</option>
                        <option value="lost">Lost mode</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </label>
                    <label className="text-sm font-bold sm:col-span-2">
                      Identifying notes
                      <textarea
                        name="luggage_notes"
                        rows={2}
                        defaultValue={tag.luggage_notes ?? ""}
                        className={field}
                        placeholder="Silver ribbon on handle, small scratch near wheel…"
                      />
                    </label>
                  </div>
                </DashboardPanel>
                <DashboardPanel
                  id="trip"
                  title="Current trip"
                  subtitle="Airline, route, connections, and baggage claim"
                  icon={<Plane size={21} />}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-bold">
                      Trip purpose
                      <select
                        name="trip_type"
                        defaultValue={tag.trip_type}
                        className={field}
                      >
                        <option value="vacation">Vacation / pleasure</option>
                        <option value="business">Business trip</option>
                        <option value="emergency">Emergency travel</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <AirlineSearch defaultValue={tag.airline ?? ""} />
                    <AirportSearch
                      name="route_origin"
                      label="From"
                      defaultValue={tag.route_origin ?? ""}
                      placeholder="Type a city, airport, IATA or ICAO code"
                    />
                    <AirportSearch
                      name="route_destination"
                      label="To"
                      defaultValue={tag.route_destination ?? ""}
                      placeholder="Type a city, airport, IATA or ICAO code"
                    />
                    <AirportStops defaultValue={tag.route_stops ?? []} />
                    <label className="text-sm font-bold">
                      Flight number
                      <input
                        name="flight_number"
                        defaultValue={tag.flight_number ?? ""}
                        className={field}
                        placeholder="DL 1923"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Travel date
                      <input type="date" name="flight_date" defaultValue={tag.flight_date ?? ""} className={field} />
                    </label>
                    <label className="text-sm font-bold">
                      Airline baggage report / PIR
                      <input
                        name="baggage_report_number"
                        defaultValue={tag.baggage_report_number ?? ""}
                        className={field}
                        placeholder="Optional claim reference"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Airline bag tag number
                      <input name="airline_bag_tag_number" defaultValue={tag.airline_bag_tag_number ?? ""} className={field} placeholder="Number printed on checked-bag receipt" />
                    </label>
                    <label className="text-sm font-bold">
                      Number of checked bags
                      <input type="number" min={1} max={20} name="checked_bag_count" defaultValue={tag.checked_bag_count || 1} className={field} />
                    </label>
                  </div>
                </DashboardPanel>
                <DashboardPanel
                  id="recovery-tools"
                  title="Recovery tools"
                  subtitle="Secure airline packet, tracker link, and alerts"
                  icon={<MapPinned size={21} />}
                >
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-bold">
                      Tracker service
                      <select
                        name="tracker_type"
                        defaultValue={tag.tracker_type ?? ""}
                        className={field}
                      >
                        <option value="">No tracker link</option>
                        <option value="apple_find_my">Apple Find My</option>
                        <option value="google_find_hub">Google Find Hub</option>
                        <option value="other">Other tracker</option>
                      </select>
                    </label>
                    <label className="text-sm font-bold">
                      Temporary tracker-sharing link
                      <input
                        type="url"
                        name="tracker_url"
                        defaultValue={tag.tracker_url ?? ""}
                        className={field}
                        placeholder="https://…"
                      />
                    </label>
                    <label className="flex items-start gap-3 rounded-2xl bg-[#eef4ff] p-4 text-sm font-bold sm:col-span-2">
                      <input
                        type="checkbox"
                        name="recovery_packet_enabled"
                        defaultChecked={tag.recovery_packet_enabled}
                        className="mt-1 accent-[#2463eb]"
                      />
                      <span>
                        Enable airline recovery packet
                        <span className="mt-1 block text-xs font-normal text-black/45">
                          Creates a secret, shareable page with luggage details,
                          itinerary, handoffs, scan history, and the optional
                          tracker link.
                        </span>
                      </span>
                    </label>
                    <div className="rounded-2xl border border-black/10 p-4 sm:col-span-2">
                      <h3 className="font-bold">New-message notifications</h3>
                      <p className="mt-1 text-xs text-black/45">
                        Choose how NamTek should alert you when a finder sends a
                        private message.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-bold">
                          Notification email
                          <input
                            type="email"
                            name="notification_email"
                            defaultValue={
                              tag.notification_email ?? user.email ?? ""
                            }
                            className={field}
                            placeholder="you@example.com"
                          />
                        </label>
                        <label className="text-sm font-bold">
                          SMS number with country code
                          <input
                            type="tel"
                            name="notification_sms_phone"
                            defaultValue={tag.notification_sms_phone ?? ""}
                            className={field}
                            placeholder="+17875551234"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold">
                          <input
                            type="checkbox"
                            name="notify_by_email"
                            defaultChecked={tag.notify_by_email}
                            className="accent-[#2463eb]"
                          />{" "}
                          Email me about finder messages
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold">
                          <input
                            type="checkbox"
                            name="notify_by_sms"
                            defaultChecked={tag.notify_by_sms}
                            className="accent-[#2463eb]"
                          />{" "}
                          Text me about finder messages
                        </label>
                      </div>
                    </div>
                  </div>
                </DashboardPanel>
                <DashboardPanel
                  id="finder-preferences"
                  title="Finder page"
                  subtitle="Public message, language, and privacy preferences"
                  icon={<ExternalLink size={21} />}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <p className="rounded-2xl bg-[#eef4ff] p-4 text-sm font-bold text-[#2454a6] sm:col-span-2">
                      Your phone number and email address are never shown to
                      finders. All communication stays inside NamTek’s private
                      recovery thread.
                    </p>
                    <label className="text-sm font-bold sm:col-span-2">
                      Finder message
                      <textarea
                        required
                        name="finder_message"
                        rows={3}
                        defaultValue={tag.finder_message}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Preferred language
                      <input
                        name="preferred_language"
                        defaultValue={tag.preferred_language}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Reward message
                      <input
                        name="reward_message"
                        defaultValue={tag.reward_message ?? ""}
                        className={field}
                        placeholder="Optional"
                      />
                    </label>
                  </div>
                </DashboardPanel>
                <button className="sticky bottom-4 z-20 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f4512d] to-[#ff7445] px-5 py-4 font-bold text-white shadow-xl shadow-[#f4512d]/20 transition hover:-translate-y-0.5">
                  <Save size={18} /> Save travel profile
                </button>
              </form>
              <aside className="space-y-5">
                <RecoveryCenter
                  tag={tag}
                  origin={
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    "https://namtek-smart-tag.vercel.app"
                  }
                />
                <section
                  id="locations"
                  className="scroll-mt-28 rounded-3xl bg-gradient-to-br from-[#111b2e] to-[#182a45] p-6 text-white shadow-lg shadow-[#111b2e]/10"
                >
                  <div className="flex items-center gap-3">
                    <MapPinned className="text-[#d8ff62]" />
                    <h2 className="text-xl font-bold">Last known scan</h2>
                  </div>
                  {latest ? (
                    <>
                      <p className="mt-6 text-3xl font-bold">
                        {new Date(latest.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                      <p className="mt-1 text-sm text-white/50">
                        {new Date(latest.created_at).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit" },
                        )}{" "}
                        ·{" "}
                        {latest.accuracy_m
                          ? `±${Math.round(latest.accuracy_m)}m`
                          : "accuracy unknown"}
                      </p>
                      <a
                        target="_blank"
                        href={`https://www.google.com/maps?q=${latest.latitude},${latest.longitude}`}
                        className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#d8ff62] px-4 py-3 font-bold text-[#171713]"
                      >
                        Open map <ExternalLink size={16} />
                      </a>
                    </>
                  ) : (
                    <div className="py-10 text-center">
                      <LocateFixed
                        className="mx-auto text-white/25"
                        size={38}
                      />
                      <p className="mt-4 text-sm text-white/45">
                        No finder has shared a location yet.
                      </p>
                    </div>
                  )}
                </section>
                <section className="rounded-3xl border border-[#dfe4eb] bg-white p-6 shadow-sm">
                  <h3 className="font-bold">Trip profile preview</h3>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f7f4ec] p-4">
                    {tag.trip_type === "business" ? (
                      <BriefcaseBusiness />
                    ) : tag.trip_type === "emergency" ? (
                      <Siren />
                    ) : (
                      <Heart />
                    )}
                    <div>
                      <p className="font-bold capitalize">{tag.trip_type}</p>
                      <p className="text-xs text-black/45">
                        {tag.airline || "No airline selected"}
                      </p>
                    </div>
                  </div>
                </section>
                <section className="rounded-3xl border border-[#dfe4eb] bg-white p-6 shadow-sm">
                  <h3 className="font-bold">Recent locations</h3>
                  <div className="mt-4 space-y-3">
                    {tag.tag_scans?.slice(0, 5).map((scan) => (
                      <a
                        target="_blank"
                        href={`https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`}
                        key={scan.id}
                        className="flex items-center justify-between border-t border-black/10 pt-3 text-sm"
                      >
                        <span>
                          {new Date(scan.created_at).toLocaleString()}
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    ))}
                    {!tag.tag_scans?.length && (
                      <p className="text-sm text-black/40">
                        Scan locations will appear here.
                      </p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
