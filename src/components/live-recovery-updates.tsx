"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSoundToggle,
  playMessageSound,
} from "@/components/message-sound";

export function LiveRecoveryUpdates() {
  const router = useRouter();
  const latest = useRef<number | null>(null);
  useEffect(() => {
    let active = true;
    async function check() {
      const response = await fetch("/api/dashboard/recovery-status", {
        cache: "no-store",
      });
      if (!response.ok || !active) return;
      const result = (await response.json()) as { latestMessageId: number };
      if (latest.current !== null && result.latestMessageId > latest.current) {
        playMessageSound();
        router.refresh();
      }
      latest.current = result.latestMessageId;
    }
    const initial = window.setTimeout(check, 0);
    const timer = window.setInterval(check, 3000);
    return () => {
      active = false;
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [router]);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f4ec] p-3">
      <p className="text-xs font-bold text-black/55">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
        Live updates active
      </p>
      <MessageSoundToggle />
    </div>
  );
}
