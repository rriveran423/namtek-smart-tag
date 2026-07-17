import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("recovery_messages").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json({ latestMessageId: data?.id ?? 0 }, { headers: { "Cache-Control": "no-store" } });
}
