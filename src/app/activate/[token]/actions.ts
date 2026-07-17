"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function claimTag(formData: FormData) {
  const token = String(formData.get("token")); const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect(`/login?next=${encodeURIComponent(`/activate/${token}`)}`);
  const { data, error } = await supabase.rpc("claim_tag", { raw_token: token });
  if (error) redirect(`/activate/${encodeURIComponent(token)}?error=${encodeURIComponent(error.message)}`);
  redirect(`/dashboard?claimed=${encodeURIComponent(String(data))}`);
}
