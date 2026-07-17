import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Languages, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { LocationShare } from "@/components/location-share";
import { createClient } from "@/lib/supabase/server";
import type { TravelTag } from "@/lib/types";

async function getTag(code: string) {
  const supabase = await createClient(); const { data } = await supabase.rpc("get_public_tag", { tag_code: code });
  return (data?.[0] as TravelTag | undefined) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params; const tag = await getTag(code);
  return { title: tag ? `Found luggage · ${tag.traveler_name ?? "NamTek traveler"}` : "Travel tag not found", description: "Help reunite this luggage with its owner." };
}

export default async function FinderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const tag = await getTag(code); if (!tag) notFound();
  const firstName = tag.traveler_name?.split(" ")[0] ?? "the owner";
  return <main className="grid-bg min-h-screen px-4 py-7 sm:px-6"><div className="mx-auto max-w-[560px]"><div className="mb-5 flex items-center justify-between px-2"><Brand/><span className="flex items-center gap-1.5 text-xs font-bold text-black/45"><ShieldCheck size={14}/> VERIFIED TRAVEL TAG</span></div><article className="card-shadow overflow-hidden rounded-[34px] border border-black/10 bg-white"><header className={`px-6 py-9 text-white sm:px-9 ${tag.status === "lost" ? "bg-[#ff5a36]" : "bg-[#2463eb]"}`}><p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">NamTek Smart Tag · {tag.public_code}</p><h1 className="display mt-4 text-4xl font-extrabold leading-tight">You found {firstName}&apos;s luggage.</h1><p className="mt-4 max-w-md leading-7 text-white/80">{tag.finder_message}</p></header><div className="space-y-5 p-6 sm:p-9"><LocationShare code={tag.public_code}/><section><h2 className="mb-3 text-sm font-bold uppercase tracking-[.14em] text-black/40">Contact the owner</h2><div className="grid gap-3 sm:grid-cols-2">{tag.public_phone&&<><a href={`tel:${tag.public_phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#d8ff62] px-4 py-4 font-bold"><Phone size={18}/> Call</a><a href={`sms:${tag.public_phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-4 font-bold"><MessageCircle size={18}/> Text</a></>}{tag.public_email&&<a href={`mailto:${tag.public_email}?subject=I found your NamTek luggage`} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f1eee5] px-4 py-4 font-bold sm:col-span-2"><Mail size={18}/> Email owner</a>}</div></section>{tag.alternate_phone&&<section className="rounded-2xl border border-black/10 p-5"><p className="text-sm text-black/50">Alternate contact</p><a href={`tel:${tag.alternate_phone}`} className="mt-1 flex items-center justify-between font-bold"><span>{tag.alternate_name ?? "Emergency contact"}</span><Phone size={17}/></a></section>}{tag.reward_message&&<p className="rounded-2xl bg-[#fff1ed] p-5 text-sm font-bold text-[#a53019]">{tag.reward_message}</p>}<p className="flex items-center justify-center gap-2 text-xs text-black/40"><Languages size={14}/> Preferred language: {tag.preferred_language}</p></div></article><p className="mt-6 text-center text-xs text-black/40">Please never share this traveler&apos;s information publicly.</p></div></main>;
}
