"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessageNotifications } from "@/lib/notifications";

export async function updateTag(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id"));
  const trackerUrl = String(formData.get("tracker_url") ?? "").trim();
  if (trackerUrl && !/^https:\/\//i.test(trackerUrl))
    redirect(
      "/dashboard?error=Tracker%20link%20must%20start%20with%20https%3A%2F%2F",
    );
  const notificationSmsPhone = String(
    formData.get("notification_sms_phone") ?? "",
  ).trim();
  if (notificationSmsPhone && !/^\+[1-9]\d{7,14}$/.test(notificationSmsPhone))
    redirect(
      "/dashboard?error=SMS%20number%20must%20include%20country%20code%2C%20for%20example%20%2B17875551234",
    );
  const values = {
    traveler_name: String(formData.get("traveler_name")),
    finder_message: String(formData.get("finder_message")),
    public_email: String(formData.get("public_email")),
    public_phone: String(formData.get("public_phone")),
    alternate_name: String(formData.get("alternate_name")),
    alternate_phone: String(formData.get("alternate_phone")),
    preferred_language: String(formData.get("preferred_language")),
    reward_message: String(formData.get("reward_message")),
    nickname: String(formData.get("nickname")),
    luggage_type: String(formData.get("luggage_type")),
    luggage_brand: String(formData.get("luggage_brand")),
    luggage_color: String(formData.get("luggage_color")),
    luggage_notes: String(formData.get("luggage_notes")),
    airline: String(formData.get("airline")),
    route_origin: String(formData.get("route_origin")),
    route_destination: String(formData.get("route_destination")),
    route_stops: String(formData.get("route_stops"))
      .split("|||")
      .map((stop) => stop.trim())
      .filter(Boolean),
    trip_type: String(formData.get("trip_type")),
    flight_number: String(formData.get("flight_number")),
    baggage_report_number: String(formData.get("baggage_report_number")),
    tracker_type: String(formData.get("tracker_type")) || null,
    tracker_url: trackerUrl || null,
    recovery_packet_enabled: formData.get("recovery_packet_enabled") === "on",
    show_direct_contact: formData.get("show_direct_contact") === "on",
    notification_email:
      String(formData.get("notification_email") ?? "").trim() || null,
    notification_sms_phone: notificationSmsPhone || null,
    notify_by_email: formData.get("notify_by_email") === "on",
    notify_by_sms: formData.get("notify_by_sms") === "on",
    show_bag_photo: formData.get("show_bag_photo") === "on",
    show_traveler_photo: formData.get("show_traveler_photo") === "on",
    status: String(formData.get("status")),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("tags")
    .update(values)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("public_code")
    .single();
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  revalidatePath(`/t/${data.public_code}`);
  redirect("/dashboard?saved=1");
}

export async function sendOwnerMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const caseId = String(formData.get("case_id"));
  const body = String(formData.get("body")).trim();
  if (!body || body.length > 2000)
    redirect("/dashboard?error=Message%20must%20be%201-2000%20characters");
  const { error } = await supabase
    .from("recovery_messages")
    .insert({ case_id: caseId, sender_role: "owner", body });
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  const { data: recovery } = await supabase
    .from("recovery_cases")
    .select(
      "finder_email, finder_notify_by_email, finder_reply_code, tags!inner(public_code)",
    )
    .eq("id", caseId)
    .single();
  await supabase
    .from("recovery_cases")
    .update({ status: "contacted", updated_at: new Date().toISOString() })
    .eq("id", caseId);
  const recoveryTag = recovery?.tags as unknown as
    | { public_code: string }
    | undefined;
  if (recovery && recoveryTag) {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || "https://namtek-smart-tag.vercel.app";
    await sendMessageNotifications({
      email: recovery.finder_email,
      emailEnabled: recovery.finder_notify_by_email,
      tagCode: recoveryTag.public_code,
      senderLabel: "The luggage owner",
      message: body,
      conversationUrl: `${origin}/recover/${recovery.finder_reply_code}`,
    });
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?message=sent");
}

export async function updateRecoveryStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const caseId = String(formData.get("case_id"));
  const status = String(formData.get("status"));
  if (
    !["open", "contacted", "pickup_arranged", "recovered", "closed"].includes(
      status,
    )
  )
    redirect("/dashboard?error=Invalid%20recovery%20status");
  const { error } = await supabase
    .from("recovery_cases")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", caseId);
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  redirect("/dashboard?recovery=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
