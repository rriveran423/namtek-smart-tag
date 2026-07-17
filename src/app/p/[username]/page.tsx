import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, Download, MapPin, Mail, Phone } from "lucide-react";
import { Brand } from "@/components/brand";
import { demoProfile } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

async function getProfile(username: string): Promise<Profile | null> {
  if (username === "alex" && !process.env.NEXT_PUBLIC_SUPABASE_URL) return demoProfile;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*, links(*)").eq("username", username).eq("is_published", true).order("position", { referencedTable: "links" }).maybeSingle();
  return data as Profile | null;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params; const profile = await getProfile(username);
  return profile ? { title: profile.display_name, description: profile.bio ?? profile.headline ?? "Namtek smart profile" } : { title: "Profile not found" };
}

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params; const profile = await getProfile(username); if (!profile) notFound();
  const initials = profile.display_name.split(" ").map((x)=>x[0]).join("").slice(0,2);
  return <main className="grid-bg min-h-screen px-4 py-8 sm:px-6"><div className="mx-auto max-w-[560px]"><div className="mb-5 flex items-center justify-between px-2"><Brand/><span className="text-xs font-bold text-black/40">SMART PROFILE</span></div><article className="card-shadow overflow-hidden rounded-[34px] border border-black/10 bg-white"><div className="h-28" style={{backgroundColor:profile.accent_color}}/><div className="px-6 pb-8 sm:px-9"><div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-white text-2xl font-extrabold text-white" style={{backgroundColor:profile.accent_color}}>{initials}</div><h1 className="display mt-5 text-4xl font-extrabold">{profile.display_name}</h1><p className="mt-1 text-lg text-black/55">{profile.headline}</p><div className="mt-5 flex flex-wrap gap-3 text-sm text-black/55">{profile.company&&<span className="flex items-center gap-1.5"><Building2 size={15}/>{profile.company}</span>}{profile.location&&<span className="flex items-center gap-1.5"><MapPin size={15}/>{profile.location}</span>}</div>{profile.bio&&<p className="mt-6 leading-7 text-black/70">{profile.bio}</p>}<div className="mt-7 grid grid-cols-2 gap-3">{profile.email&&<a href={`mailto:${profile.email}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-3.5 font-bold"><Mail size={17}/> Email</a>}{profile.phone&&<a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-3.5 font-bold"><Phone size={17}/> Call</a>}</div><div className="mt-3 space-y-3">{profile.links?.map((link)=><a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl px-5 py-4 font-bold" style={{backgroundColor:profile.accent_color,color:"white"}}>{link.label}<ArrowUpRight size={18}/></a>)}</div><a href={`/api/vcard/${profile.username}`} className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-black/55"><Download size={16}/> Save contact</a></div></article><p className="mt-7 text-center text-xs text-black/40">Powered by Namtek · Tap into what&apos;s next</p></div></main>;
}
