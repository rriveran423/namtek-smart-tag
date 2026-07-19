"use client";

import { useEffect, useState } from "react";

export function ElapsedSince({ date }: { date: string }) {
  const [minutes, setMinutes] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setMinutes(Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000)));
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [date]);
  if (minutes === null) return null;
  return <span className="rounded-full bg-[#f4f7fb] px-3 py-2">Time since landing: {Math.floor(minutes / 60)}h {minutes % 60}m</span>;
}
