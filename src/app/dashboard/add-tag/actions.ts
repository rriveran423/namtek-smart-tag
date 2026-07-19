"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function activationToken(value: string) {
  const raw = value.trim();

  try {
    const url = new URL(raw);
    const segments = url.pathname.split("/").filter(Boolean);
    const activateIndex = segments.indexOf("activate");
    if (activateIndex >= 0 && segments[activateIndex + 1]) {
      return decodeURIComponent(segments[activateIndex + 1]);
    }
  } catch {
    // A plain activation code is expected in most cases.
  }

  return raw;
}

export async function addTag(formData: FormData) {
  const token = activationToken(String(formData.get("token") ?? ""));
  if (!token) redirect("/dashboard/add-tag?error=Enter%20an%20activation%20code.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Fadd-tag");

  const { data, error } = await supabase.rpc("claim_tag", {
    raw_token: token,
  });
  if (error) {
    redirect(`/dashboard/add-tag?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard?claimed=${encodeURIComponent(String(data))}`);
}
