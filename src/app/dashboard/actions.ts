"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessageNotifications } from "@/lib/notifications";

export async function renameTag(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const publicCode = String(formData.get("public_code") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!nickname || nickname.length > 60) {
    redirect(
      `/dashboard?tag=${encodeURIComponent(publicCode)}&error=${encodeURIComponent("Luggage name must be between 1 and 60 characters.")}`,
    );
  }

  const { error } = await supabase
    .from("tags")
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) {
    redirect(
      `/dashboard?tag=${encodeURIComponent(publicCode)}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/t/${publicCode}`);
  redirect(
    `/dashboard?tag=${encodeURIComponent(publicCode)}&renamed=1`,
  );
}

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
    flight_date: String(formData.get("flight_date")) || null,
    baggage_report_number: String(formData.get("baggage_report_number")),
    airline_bag_tag_number: String(formData.get("airline_bag_tag_number")),
    checked_bag_count: Math.max(1, Math.min(20, Number(formData.get("checked_bag_count")) || 1)),
    tracker_type: String(formData.get("tracker_type")) || null,
    tracker_url: trackerUrl || null,
    recovery_packet_enabled: formData.get("recovery_packet_enabled") === "on",
    show_direct_contact: false,
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

export async function startLuggageJourney(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tagId = String(formData.get("tag_id"));
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("id, public_code, airline, flight_number, flight_date, route_origin, route_destination, airline_bag_tag_number, checked_bag_count")
    .eq("id", tagId)
    .eq("owner_id", user.id)
    .single();
  if (tagError || !tag) redirect("/dashboard?error=Unable%20to%20find%20that%20tag");
  if (!tag.airline || !tag.flight_number || !tag.flight_date || !tag.route_origin || !tag.route_destination) {
    redirect(`/dashboard?tag=${encodeURIComponent(tag.public_code)}&error=${encodeURIComponent("Save the airline, flight number, travel date, origin, and destination before submitting luggage.")}`);
  }
  const { data: trip, error } = await supabase
    .from("tag_trips")
    .insert({
      tag_id: tag.id,
      owner_id: user.id,
      airline: tag.airline,
      flight_number: tag.flight_number,
      flight_date: tag.flight_date,
      origin: tag.route_origin,
      destination: tag.route_destination,
      airline_bag_tag_number: tag.airline_bag_tag_number || null,
      checked_bag_count: tag.checked_bag_count || 1,
      status: "submitted",
    })
    .select("id")
    .single();
  if (error) redirect(`/dashboard?tag=${encodeURIComponent(tag.public_code)}&error=${encodeURIComponent(error.message.includes("one_open_trip_per_tag") ? "This luggage already has an active journey." : error.message)}`);
  await supabase.from("trip_events").insert({
    trip_id: trip.id,
    event_type: "submitted",
    title: "Luggage submitted to airline",
    detail: `${tag.airline} ${tag.flight_number} · ${tag.route_origin} to ${tag.route_destination}`,
    source: "customer",
  });
  revalidatePath("/dashboard");
  redirect(`/dashboard?tag=${encodeURIComponent(tag.public_code)}&journey=started`);
}

export async function updateJourneyStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tripId = String(formData.get("trip_id"));
  const tagCode = String(formData.get("tag_code"));
  const action = String(formData.get("journey_action"));
  const allowed = ["collected", "lost", "damaged", "restore"];
  if (!allowed.includes(action)) redirect("/dashboard?error=Invalid%20journey%20action");
  const { data: trip } = await supabase
    .from("tag_trips")
    .select("id, status")
    .eq("id", tripId)
    .eq("owner_id", user.id)
    .single();
  if (!trip) redirect("/dashboard?error=Journey%20not%20found");

  const status = action === "restore" ? "landed" : action === "damaged" ? "lost" : action;
  const values = action === "collected"
    ? { status, completed_at: new Date().toISOString(), next_reminder_at: null, updated_at: new Date().toISOString() }
    : action === "restore"
      ? { status, issue_type: null, archived_at: null, completed_at: null, next_reminder_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() }
      : { status, issue_type: action === "damaged" ? "damaged" : action === "lost" ? "missing" : null, next_reminder_at: null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("tag_trips").update(values).eq("id", tripId).eq("owner_id", user.id);
  if (error) redirect(`/dashboard?tag=${encodeURIComponent(tagCode)}&error=${encodeURIComponent(error.message)}`);
  await supabase.from("trip_events").insert({
    trip_id: tripId,
    event_type: action,
    title: action === "collected" ? "Luggage collected and confirmed" : action === "lost" ? "Luggage reported missing" : action === "damaged" ? "Luggage reported damaged" : "Journey restored for review",
    detail: action === "collected" ? "The owner confirmed that the luggage is back in their possession." : null,
    source: "customer",
  });
  if (action === "collected") {
    await supabase
      .from("tags")
      .update({
        airline: null,
        flight_number: null,
        flight_date: null,
        route_origin: null,
        route_destination: null,
        route_stops: [],
        baggage_report_number: null,
        airline_bag_tag_number: null,
        checked_bag_count: 1,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("public_code", tagCode)
      .eq("owner_id", user.id);
  }
  if (action === "lost" || action === "damaged") await supabase.from("tags").update({ status: "lost" }).eq("public_code", tagCode).eq("owner_id", user.id);
  revalidatePath("/dashboard");
  redirect(action === "collected" ? `/dashboard/history?completed=1` : `/dashboard?tag=${encodeURIComponent(tagCode)}&journey=${encodeURIComponent(action)}`);
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
