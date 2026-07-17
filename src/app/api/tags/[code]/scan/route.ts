import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const latitude = Number(body?.latitude); const longitude = Number(body?.longitude); const accuracy = Number(body?.accuracy);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_tag_scan", { tag_code: code, scan_latitude: latitude, scan_longitude: longitude, scan_accuracy: Number.isFinite(accuracy) ? accuracy : null });
  if (error || !data) return NextResponse.json({ error: "Unable to record scan" }, { status: 400 });
  return NextResponse.json({ recorded: true });
}
