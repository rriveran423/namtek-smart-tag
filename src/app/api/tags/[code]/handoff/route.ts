import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessageNotifications } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_finder_handoff", {
    tag_code: code,
    submitted_name: String(body.name ?? ""),
    submitted_contact: String(body.contact ?? ""),
    submitted_email: String(body.email ?? ""),
    submitted_notify_email: body.notifyEmail === true,
    submitted_handoff_type: String(body.handoffType ?? "still_with_me"),
    submitted_location: String(body.location ?? ""),
    submitted_note: String(body.note ?? ""),
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  const admin = createAdminClient();
  if (admin) {
    const { data: thread } = await supabase.rpc("get_finder_recovery", {
      raw_token: data,
    });
    const caseId = (thread as { case?: { id?: string } } | null)?.case?.id;
    if (caseId) {
      const { data: recovery } = await admin
        .from("recovery_cases")
        .select(
          "tags!inner(public_code, notification_email, notification_sms_phone, notify_by_email, notify_by_sms)",
        )
        .eq("id", caseId)
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
          senderLabel: "A finder",
          message: String(body.note ?? "New luggage handoff reported"),
          conversationUrl: `${origin}/dashboard?tag=${ownerTag.public_code}`,
        });
      }
    }
  }
  return NextResponse.json({ token: data });
}
