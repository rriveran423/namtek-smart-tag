import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ExternalLink,
  Heart,
  LocateFixed,
  Luggage,
  MapPinned,
  PackageCheck,
  Plane,
  Save,
  Siren,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { AirportSearch, AirportStops } from "@/components/airport-search";
import { ImageUpload } from "@/components/image-upload";
import { createClient } from "@/lib/supabase/server";
import type { TravelTag } from "@/lib/types";
import { signOut, updateTag } from "./actions";

export const dynamic = "force-dynamic";
const airlines = [
  "",
  "Aeroméxico",
  "Air Canada",
  "Air France",
  "Alaska Airlines",
  "American Airlines",
  "British Airways",
  "Delta Air Lines",
  "Emirates",
  "Frontier Airlines",
  "Iberia",
  "JetBlue",
  "KLM",
  "Lufthansa",
  "Qatar Airways",
  "Southwest Airlines",
  "Spirit Airlines",
  "Turkish Airlines",
  "United Airlines",
  "Virgin Atlantic",
  "Other",
];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    claimed?: string;
    error?: string;
    tag?: string;
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
    .select("*, tag_scans(*)")
    .eq("owner_id", user.id)
    .order("created_at", { referencedTable: "tag_scans", ascending: false });
  const tags = (data ?? []) as TravelTag[];
  const tag = tags.find((item) => item.public_code === params.tag) ?? tags[0];
  const latest = tag?.tag_scans?.[0];
  const field =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#ff5a36]";
  return (
    <main className="min-h-screen bg-[#eeebe2]">
      <nav className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5 lg:px-10">
        <Brand />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-black/45 sm:block">
            {user.email}
          </span>
          <form action={signOut}>
            <button className="text-sm font-bold">Sign out</button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#ff5a36]">
              Traveler dashboard
            </p>
            <h1 className="display mt-2 text-4xl font-extrabold">
              Your journeys
            </h1>
          </div>
          {tag && (
            <Link
              target="_blank"
              href={`/t/${tag.public_code}`}
              className="flex items-center gap-2 rounded-full bg-[#171713] px-5 py-3 text-sm font-bold text-white"
            >
              View finder page <ExternalLink size={15} />
            </Link>
          )}
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
          </section>
        ) : (
          <>
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {tags.map((item) => (
                <Link
                  href={`/dashboard?tag=${item.public_code}`}
                  key={item.id}
                  className={`min-w-[210px] rounded-2xl border p-4 ${item.id === tag.id ? "border-[#ff5a36] bg-white" : "border-black/10 bg-white/50"}`}
                >
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-black/40">
                    {item.public_code}
                  </p>
                  <p className="mt-1 font-bold">
                    {item.nickname || item.luggage_type || "My luggage"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-black/45">
                    {item.trip_type} · {item.status}
                  </p>
                </Link>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
              <form
                action={updateTag}
                className="space-y-8 rounded-3xl bg-white p-6 sm:p-8"
              >
                <input type="hidden" name="id" value={tag.id} />
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#fff1ed] p-3">
                      <Luggage className="text-[#ff5a36]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        Tag {tag.public_code}
                      </h2>
                      <p className="text-sm text-black/45">
                        Luggage and traveler identity
                      </p>
                    </div>
                  </div>
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
                      Tag nickname
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
                </section>
                <section className="border-t border-black/10 pt-8">
                  <div className="mb-5 flex items-center gap-3">
                    <Plane className="text-[#2463eb]" />
                    <h2 className="text-xl font-bold">Current trip</h2>
                  </div>
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
                    <label className="text-sm font-bold">
                      Airline
                      <select
                        name="airline"
                        defaultValue={tag.airline ?? ""}
                        className={field}
                      >
                        {airlines.map((airline) => (
                          <option key={airline} value={airline}>
                            {airline || "Select airline (optional)"}
                          </option>
                        ))}
                      </select>
                    </label>
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
                  </div>
                </section>
                <section className="border-t border-black/10 pt-8">
                  <h2 className="mb-5 text-xl font-bold">
                    Finder contact & message
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                      Contact phone
                      <input
                        name="public_phone"
                        defaultValue={tag.public_phone ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Contact email
                      <input
                        type="email"
                        name="public_email"
                        defaultValue={tag.public_email ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Alternate contact
                      <input
                        name="alternate_name"
                        defaultValue={tag.alternate_name ?? ""}
                        className={field}
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Alternate phone
                      <input
                        name="alternate_phone"
                        defaultValue={tag.alternate_phone ?? ""}
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
                </section>
                <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5a36] px-5 py-4 font-bold text-white">
                  <Save size={18} /> Save travel profile
                </button>
              </form>
              <aside className="space-y-5">
                <section className="rounded-3xl bg-[#171713] p-6 text-white">
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
                <section className="rounded-3xl bg-white p-6">
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
                <section className="rounded-3xl bg-white p-6">
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
