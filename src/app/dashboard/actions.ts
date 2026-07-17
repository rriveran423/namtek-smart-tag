"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateTag(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const id = String(formData.get("id"));
  const values = {
    traveler_name: String(formData.get("traveler_name")), finder_message: String(formData.get("finder_message")),
    public_email: String(formData.get("public_email")), public_phone: String(formData.get("public_phone")),
    alternate_name: String(formData.get("alternate_name")), alternate_phone: String(formData.get("alternate_phone")),
    preferred_language: String(formData.get("preferred_language")), reward_message: String(formData.get("reward_message")),
    status: String(formData.get("status")), updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("tags").update(values).eq("id", id).eq("owner_id", user.id).select("public_code").single();
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard"); revalidatePath(`/t/${data.public_code}`); redirect("/dashboard?saved=1");
}

export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }
