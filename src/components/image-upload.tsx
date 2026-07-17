"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { Camera, LoaderCircle, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ImageUpload({ tagId, kind, currentUrl, circular = false }: { tagId: string; kind: "bag" | "traveler"; currentUrl: string | null; circular?: boolean }) {
  const input = useRef<HTMLInputElement>(null); const [url, setUrl] = useState(currentUrl); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return; if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG, or WebP under 5 MB."); return; }
    setLoading(true); setError(""); const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please sign in again."); setLoading(false); return; }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"; const path = `${user.id}/${tagId}/${kind}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("tag-images").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setError(uploadError.message); setLoading(false); return; }
    const { data } = supabase.storage.from("tag-images").getPublicUrl(path); const photoUrl = `${data.publicUrl}?v=${Date.now()}`;
    const column = kind === "bag" ? "bag_photo_url" : "traveler_photo_url";
    const { error: updateError } = await supabase.from("tags").update({ [column]: photoUrl }).eq("id", tagId);
    if (updateError) setError(updateError.message); else setUrl(photoUrl); setLoading(false);
  }
  return <div><button type="button" onClick={() => input.current?.click()} className={`relative flex w-full items-center justify-center overflow-hidden border-2 border-dashed border-black/15 bg-[#f7f4ec] ${circular ? "mx-auto aspect-square max-w-[180px] rounded-full" : "aspect-[4/3] rounded-2xl"}`}>{url ? <img src={url} alt={kind === "bag" ? "Uploaded luggage" : "Uploaded traveler"} className="h-full w-full object-cover"/> : <span className="flex flex-col items-center gap-2 text-sm font-bold text-black/45">{circular ? <Camera/> : <Upload/>}{loading ? "Uploading…" : `Upload ${kind === "bag" ? "luggage" : "traveler"} photo`}</span>}{loading&&<span className="absolute inset-0 flex items-center justify-center bg-white/75"><LoaderCircle className="animate-spin"/></span>}</button><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event)=>upload(event.target.files?.[0])}/>{error&&<p className="mt-2 text-xs text-red-600">{error}</p>}<p className="mt-2 text-center text-[11px] text-black/40">JPG, PNG or WebP · 5 MB maximum</p></div>;
}
