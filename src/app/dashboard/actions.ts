"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = {
    id: user.id,
    username: String(formData.get("username")).toLowerCase().replace(/[^a-z0-9_-]/g, ""),
    display_name: String(formData.get("display_name")),
    headline: String(formData.get("headline")),
    bio: String(formData.get("bio")),
    company: String(formData.get("company")),
    location: String(formData.get("location")),
    email: String(formData.get("email")),
    phone: String(formData.get("phone")),
    accent_color: String(formData.get("accent_color")),
    is_published: formData.get("is_published") === "on",
  };
  const { error } = await supabase.from("profiles").upsert(profile);
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  revalidatePath(`/p/${profile.username}`);
  redirect("/dashboard?saved=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
