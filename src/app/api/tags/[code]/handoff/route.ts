import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_finder_handoff", {
    tag_code: code,
    submitted_name: String(body.name ?? ""),
    submitted_contact: String(body.contact ?? ""),
    submitted_handoff_type: String(body.handoffType ?? "still_with_me"),
    submitted_location: String(body.location ?? ""),
    submitted_note: String(body.note ?? ""),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ token: data });
}
