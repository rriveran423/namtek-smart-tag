"use client";

import { useState } from "react";
import { CheckCircle2, LocateFixed, LoaderCircle } from "lucide-react";

export function LocationShare({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Share your current location to help the owner find this bag.");

  function shareLocation() {
    if (!navigator.geolocation) {
      setState("error"); setMessage("Location sharing is not supported on this device."); return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const response = await fetch(`/api/tags/${code}/scan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      });
      if (response.ok) { setState("done"); setMessage("Location shared. Thank you for helping reunite this bag with its owner."); }
      else { setState("error"); setMessage("We could not save the location. You can still contact the owner below."); }
    }, () => { setState("error"); setMessage("Location was not shared. You can still contact the owner below."); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  return <section className="rounded-3xl bg-[#171713] p-6 text-white"><div className="flex items-start gap-4">{state === "done" ? <CheckCircle2 className="mt-1 shrink-0 text-[#d8ff62]"/> : <LocateFixed className="mt-1 shrink-0 text-[#ff7557]"/>}<div><h2 className="text-lg font-bold">Help locate this luggage</h2><p className="mt-1 text-sm leading-6 text-white/60">{message}</p></div></div>{state !== "done" && <button onClick={shareLocation} disabled={state === "loading"} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d8ff62] px-5 py-3.5 font-bold text-[#171713] disabled:opacity-60">{state === "loading" ? <LoaderCircle className="animate-spin" size={18}/> : <LocateFixed size={18}/>} {state === "loading" ? "Requesting permission…" : "Share this bag’s location"}</button>}<p className="mt-3 text-center text-[11px] text-white/35">Your browser will ask permission. NamTek records coordinates, accuracy, and time only.</p></section>;
}
