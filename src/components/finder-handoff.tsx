"use client";

import { useState } from "react";
import { Building2, HandHeart, LockKeyhole, MapPin } from "lucide-react";
import { useFinderCopy } from "@/components/finder-language";

export function FinderHandoff({ code }: { code: string }) {
  const t = useFinderCopy();
  const [handoffType, setHandoffType] = useState("still_with_me");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  async function submit(formData: FormData) {
    setState("sending");
    const response = await fetch(`/api/tags/${code}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        contact: formData.get("contact"),
        email: formData.get("email"),
        notifyEmail: formData.get("notify_email") === "on",
        handoffType,
        location: formData.get("location"),
        note: formData.get("note"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setState("error");
      return;
    }
    window.location.href = `/recover/${result.token}?created=1`;
  }

  const choices = [
    ["still_with_me", t.still],
    ["airline", t.airline],
    ["airport_lost_found", t.airport],
    ["hotel", t.hotel],
    ["police", t.police],
    ["other", t.other],
  ];
  return (
    <section className="rounded-3xl border-2 border-[#2463eb]/15 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-[#d8ff62] p-3">
          <HandHeart size={22} />
        </span>
        <div>
          <h2 className="text-xl font-extrabold">{t.help}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-black/45">
            <LockKeyhole size={12} /> Private details are only visible to the
            owner.
          </p>
        </div>
      </div>
      <form action={submit} className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-bold">{t.handoff}</legend>
          <div className="grid grid-cols-2 gap-2">
            {choices.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setHandoffType(value)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${handoffType === value ? "border-[#2463eb] bg-[#eef4ff] text-[#2454a6]" : "border-black/10"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="relative block">
          <MapPin className="absolute left-3 top-3.5 text-black/35" size={16} />
          <input
            required
            name="location"
            className="w-full rounded-xl border border-black/15 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#2463eb]"
            placeholder={t.location}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            className="rounded-xl border border-black/15 px-3 py-3 text-sm outline-none focus:border-[#2463eb]"
            placeholder={t.name}
          />
          <input
            name="contact"
            className="rounded-xl border border-black/15 px-3 py-3 text-sm outline-none focus:border-[#2463eb]"
            placeholder={t.contactInfo}
          />
        </div>
        <div className="rounded-2xl bg-[#f7f4ec] p-4">
          <input
            type="email"
            name="email"
            className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#2463eb]"
            placeholder="Email for new-message alerts (optional)"
          />
          <label className="mt-3 flex items-start gap-2 text-xs font-bold">
            <input
              type="checkbox"
              name="notify_email"
              className="mt-0.5 accent-[#2463eb]"
            />
            <span>
              Email me when the luggage owner replies.
              <span className="mt-1 block font-normal text-black/45">
                Your email stays private and is used only for this recovery.
              </span>
            </span>
          </label>
        </div>
        <label className="relative block">
          <Building2
            className="absolute left-3 top-3.5 text-black/35"
            size={16}
          />
          <textarea
            required
            name="note"
            rows={3}
            className="w-full rounded-xl border border-black/15 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#2463eb]"
            placeholder={t.note}
          />
        </label>
        {state === "error" && (
          <p className="text-sm font-bold text-red-600">{t.error}</p>
        )}
        <button
          disabled={state === "sending"}
          className="w-full rounded-full bg-[#2463eb] px-4 py-3.5 font-bold text-white disabled:opacity-60"
        >
          {state === "sending" ? t.sending : t.submit}
        </button>
      </form>
    </section>
  );
}
