"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LockKeyhole, Send } from "lucide-react";
import {
  MessageSoundToggle,
  playMessageSound,
} from "@/components/message-sound";

type Thread = {
  case: {
    finder_name: string | null;
    handoff_type: string;
    handoff_location: string | null;
    status: string;
    created_at: string;
  };
  tag: {
    public_code: string;
    traveler_name: string | null;
    nickname: string | null;
    bag_photo_url: string | null;
  };
  messages: {
    id: number;
    sender_role: "finder" | "owner";
    body: string;
    created_at: string;
  }[];
};

export function FinderThread({
  token,
  created,
}: {
  token: string;
  created: boolean;
}) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState("");
  const latestOwnerMessage = useRef<number | null>(null);
  async function load() {
    const response = await fetch(`/api/recover/${token}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      setError("This recovery thread is unavailable.");
      return;
    }
    const next = (await response.json()) as Thread;
    const newest = Math.max(
      0,
      ...next.messages
        .filter((message) => message.sender_role === "owner")
        .map((message) => message.id),
    );
    if (
      latestOwnerMessage.current !== null &&
      newest > latestOwnerMessage.current
    )
      playMessageSound();
    latestOwnerMessage.current = newest;
    setThread(next);
  }
  useEffect(() => {
    const initial = window.setTimeout(load, 0);
    const timer = setInterval(load, 3000);
    return () => {
      window.clearTimeout(initial);
      clearInterval(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function send(formData: FormData) {
    const message = String(formData.get("message") ?? "");
    if (!message.trim()) return;
    const response = await fetch(`/api/recover/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (response.ok) {
      (
        document.getElementById("finder-message-form") as HTMLFormElement
      )?.reset();
      await load();
    }
  }
  if (error)
    return <p className="rounded-2xl bg-red-100 p-5 text-red-700">{error}</p>;
  if (!thread)
    return (
      <p className="p-8 text-center text-black/45">
        Loading secure recovery thread…
      </p>
    );
  return (
    <div className="space-y-5">
      {created && (
        <div className="flex items-start gap-3 rounded-2xl bg-[#d8ff62] p-4">
          <CheckCircle2 className="shrink-0" />
          <div>
            <p className="font-bold">
              The owner can now see your recovery update.
            </p>
            <p className="mt-1 text-sm text-black/60">
              Bookmark this private page so you can continue communicating.
            </p>
          </div>
        </div>
      )}
      <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
        {thread.tag.bag_photo_url && (
          <img
            src={thread.tag.bag_photo_url}
            alt="Luggage"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-black/40">
            NamTek {thread.tag.public_code}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            Private recovery thread
          </h1>
          <p className="mt-1 text-sm text-black/50">
            {thread.case.handoff_location} ·{" "}
            <span className="capitalize">
              {thread.case.status.replaceAll("_", " ")}
            </span>
          </p>
        </div>
        <MessageSoundToggle />
      </section>
      <section className="rounded-3xl bg-white p-5 sm:p-6">
        <p className="mb-5 flex items-center gap-2 text-xs font-bold text-black/45">
          <LockKeyhole size={14} /> Only you and the luggage owner can read
          these messages.
        </p>
        <div className="space-y-3">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_role === "finder" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_role === "finder" ? "bg-[#2463eb] text-white" : "bg-[#f1eee5]"}`}
              >
                <p className="text-xs font-bold opacity-60">
                  {message.sender_role === "finder" ? "You" : "Luggage owner"}
                </p>
                <p className="mt-1 text-sm leading-6">{message.body}</p>
                <p className="mt-1 text-[10px] opacity-50">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        {!["recovered", "closed"].includes(thread.case.status) && (
          <form
            id="finder-message-form"
            action={send}
            className="mt-5 flex gap-2 border-t border-black/10 pt-5"
          >
            <input
              required
              maxLength={2000}
              name="message"
              className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#2463eb]"
              placeholder="Write a private message…"
            />
            <button
              aria-label="Send message"
              className="rounded-xl bg-[#2463eb] p-3 text-white"
            >
              <Send />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
