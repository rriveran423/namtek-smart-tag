"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function JourneyLiveRefresh({ tripId }: { tripId: string }) {
  const router = useRouter();
  const marker = useRef<string | null>(null);
  useEffect(() => {
    async function check() {
      const response = await fetch(`/api/dashboard/journey-status?tripId=${encodeURIComponent(tripId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { marker: string };
      if (marker.current === null) marker.current = data.marker;
      else if (marker.current !== data.marker) { marker.current = data.marker; router.refresh(); }
    }
    check();
    const timer = window.setInterval(check, 15000);
    return () => window.clearInterval(timer);
  }, [router, tripId]);
  return null;
}
