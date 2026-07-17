import {
  ExternalLink,
  MapPin,
  MessageCircle,
  PackageCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { TravelTag } from "@/lib/types";
import {
  sendOwnerMessage,
  updateRecoveryStatus,
} from "@/app/dashboard/actions";

const handoffLabels: Record<string, string> = {
  still_with_me: "Still with finder",
  airline: "Airline desk",
  airport_lost_found: "Airport lost & found",
  hotel: "Hotel",
  police: "Police",
  other: "Other location",
};

export function RecoveryCenter({
  tag,
  origin,
}: {
  tag: TravelTag;
  origin: string;
}) {
  const cases = tag.recovery_cases ?? [];
  const packetUrl = `${origin}/recovery/${tag.recovery_share_code}`;
  return (
    <section className="rounded-3xl bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-[#fff1ed] p-3 text-[#ff5a36]">
          <ShieldCheck />
        </span>
        <div>
          <h2 className="text-xl font-extrabold">Recovery Center</h2>
          <p className="text-sm text-black/45">
            Finder handoffs and private messages
          </p>
        </div>
      </div>
      {tag.recovery_packet_enabled && (
        <div className="mt-5 rounded-2xl bg-[#eef4ff] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2454a6]">
            Airline recovery packet
          </p>
          <a
            href={packetUrl}
            target="_blank"
            className="mt-2 flex items-center justify-between gap-3 break-all text-sm font-bold"
          >
            Open secure packet <ExternalLink className="shrink-0" size={15} />
          </a>
          <p className="mt-2 text-xs text-black/45">
            Share this link only with airline or recovery personnel.
          </p>
        </div>
      )}
      <div className="mt-5 space-y-4">
        {cases.map((recovery) => (
          <article
            key={recovery.id}
            className="rounded-2xl border border-black/10 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {recovery.finder_name || "Anonymous finder"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-black/50">
                  <MapPin size={12} />
                  {handoffLabels[recovery.handoff_type]}
                  {recovery.handoff_location
                    ? ` · ${recovery.handoff_location}`
                    : ""}
                </p>
                {recovery.finder_contact && (
                  <p className="mt-1 text-xs text-black/45">
                    Private contact: {recovery.finder_contact}
                  </p>
                )}
              </div>
              <form action={updateRecoveryStatus}>
                <input type="hidden" name="case_id" value={recovery.id} />
                <select
                  name="status"
                  defaultValue={recovery.status}
                  className="rounded-full border border-black/10 bg-[#f7f4ec] px-3 py-2 text-xs font-bold capitalize"
                >
                  <option value="open">Open</option>
                  <option value="contacted">Contacted</option>
                  <option value="pickup_arranged">Pickup arranged</option>
                  <option value="recovered">Recovered</option>
                  <option value="closed">Closed</option>
                </select>
                <button className="ml-1 rounded-full bg-[#171713] px-3 py-2 text-xs font-bold text-white">
                  Update
                </button>
              </form>
            </div>
            <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
              {recovery.recovery_messages?.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl p-3 text-sm ${message.sender_role === "owner" ? "ml-6 bg-[#eef4ff]" : "mr-6 bg-[#f1eee5]"}`}
                >
                  <p className="text-[10px] font-bold uppercase text-black/40">
                    {message.sender_role === "owner" ? "You" : "Finder"}
                  </p>
                  <p className="mt-1 leading-5">{message.body}</p>
                </div>
              ))}
              {!recovery.recovery_messages?.length && (
                <p className="text-sm text-black/40">No messages yet.</p>
              )}
            </div>
            {!["recovered", "closed"].includes(recovery.status) && (
              <form action={sendOwnerMessage} className="mt-3 flex gap-2">
                <input type="hidden" name="case_id" value={recovery.id} />
                <input
                  required
                  maxLength={2000}
                  name="body"
                  className="min-w-0 flex-1 rounded-xl border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#2463eb]"
                  placeholder="Reply privately…"
                />
                <button
                  aria-label="Send reply"
                  className="rounded-xl bg-[#2463eb] p-2.5 text-white"
                >
                  <Send size={17} />
                </button>
              </form>
            )}
          </article>
        ))}
        {cases.length === 0 && (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto text-black/20" size={34} />
            <p className="mt-3 text-sm text-black/40">
              Finder updates and private messages will appear here.
            </p>
          </div>
        )}
      </div>
      {tag.status === "lost" && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#fff1ed] p-3 text-xs font-bold text-[#a53019]">
          <PackageCheck size={16} /> Lost Mode is active for this tag.
        </p>
      )}
    </section>
  );
}
