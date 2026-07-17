import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessageNotifications } from "@/lib/notifications";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_finder_recovery", {
    raw_token: token,
  });
  if (error || !data)
    return NextResponse.json(
      { error: "Recovery thread not found" },
      { status: 404 },
    );
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { message } = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_finder_message", {
    raw_token: token,
    message_body: String(message ?? ""),
  });
  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "Message could not be sent" },
      { status: 400 },
    );
  const admin = createAdminClient();
  if (admin) {
    const { data: recovery } = await admin
      .from("recovery_cases")
      .select(
        "tags!inner(public_code, notification_email, notification_sms_phone, notify_by_email, notify_by_sms)",
      )
      .eq("id", data)
      .single();
    const ownerTag = recovery?.tags as unknown as
      | {
          public_code: string;
          notification_email: string | null;
          notification_sms_phone: string | null;
          notify_by_email: boolean;
          notify_by_sms: boolean;
        }
      | undefined;
    if (ownerTag) {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      await sendMessageNotifications({
        email: ownerTag.notification_email,
        phone: ownerTag.notification_sms_phone,
        emailEnabled: ownerTag.notify_by_email,
        smsEnabled: ownerTag.notify_by_sms,
        tagCode: ownerTag.public_code,
        senderLabel: "The finder",
        message: String(message),
        conversationUrl: `${origin}/dashboard?tag=${ownerTag.public_code}`,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
