import Link from "next/link";
import { PackageCheck, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { claimTag } from "./actions";

export default async function Activate({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params; const { error } = await searchParams; const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <main className="grid-bg flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-lg"><div className="mb-6 text-center"><Brand/></div><section className="card-shadow rounded-[32px] bg-white p-8 text-center sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d8ff62]"><PackageCheck size={32}/></div><h1 className="display mt-6 text-4xl font-extrabold">Activate your Smart Tag</h1><p className="mt-3 leading-7 text-black/55">This private package code will securely connect the matching luggage tag to your NamTek account. It can only be used once.</p>{error&&<p className="mt-5 rounded-xl bg-red-100 p-3 text-sm text-red-800">{error}</p>}{user?<form action={claimTag} className="mt-7"><input type="hidden" name="token" value={token}/><button className="w-full rounded-full bg-[#171713] px-6 py-4 font-bold text-white">Activate tag for {user.email}</button></form>:<Link href={`/login?next=${encodeURIComponent(`/activate/${token}`)}`} className="mt-7 block rounded-full bg-[#171713] px-6 py-4 font-bold text-white">Sign in to activate</Link>}<p className="mt-6 flex items-center justify-center gap-2 text-xs text-black/40"><ShieldCheck size={14}/> NamTek ownership verification</p></section></div></main>;
}
