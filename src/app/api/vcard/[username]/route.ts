import { createClient } from "@/lib/supabase/server";
import { demoProfile } from "@/lib/demo";

export async function GET(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let profile = username === "alex" && !process.env.NEXT_PUBLIC_SUPABASE_URL ? demoProfile : null;
  if (!profile) { const supabase = await createClient(); const { data } = await supabase.from("profiles").select("*").eq("username", username).eq("is_published", true).maybeSingle(); profile = data; }
  if (!profile) return new Response("Not found", { status: 404 });
  const safe = (value: string | null) => (value ?? "").replace(/[;,\\n]/g, " ");
  const card = ["BEGIN:VCARD","VERSION:3.0",`FN:${safe(profile.display_name)}`,`ORG:${safe(profile.company)}`,`TITLE:${safe(profile.headline)}`,`EMAIL:${safe(profile.email)}`,`TEL:${safe(profile.phone)}`,`NOTE:${safe(profile.bio)}`,"END:VCARD"].join("\r\n");
  return new Response(card, { headers: { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": `attachment; filename="${profile.username}.vcf"` } });
}
