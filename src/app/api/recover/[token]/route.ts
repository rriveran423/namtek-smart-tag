import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_finder_recovery", { raw_token: token });
  if (error || !data) return NextResponse.json({ error: "Recovery thread not found" }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { message } = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_finder_message", { raw_token: token, message_body: String(message ?? "") });
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Message could not be sent" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
