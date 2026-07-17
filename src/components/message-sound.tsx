"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export function soundIsEnabled() {
  return (
    typeof window !== "undefined" &&
    localStorage.getItem("namtek-message-sound") === "on"
  );
}
export function playMessageSound() {
  if (!soundIsEnabled()) return;
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, context.currentTime);
  oscillator.frequency.setValueAtTime(880, context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.36);
  oscillator.onended = () => context.close();
}
export function MessageSoundToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(soundIsEnabled()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("namtek-message-sound", next ? "on" : "off");
    if (next) setTimeout(playMessageSound, 0);
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold"
    >
      {enabled ? <Bell size={14} /> : <BellOff size={14} />} Sound{" "}
      {enabled ? "on" : "off"}
    </button>
  );
}
