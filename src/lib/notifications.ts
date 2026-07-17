type NotificationRequest = {
  email?: string | null;
  phone?: string | null;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  recipientName?: string | null;
  tagCode: string;
  senderLabel: string;
  message: string;
  conversationUrl: string;
};

const clean = (value: string) => value.replace(/[<>]/g, "").slice(0, 500);

export async function sendMessageNotifications(request: NotificationRequest) {
  const tasks: Promise<unknown>[] = [];
  const snippet = clean(request.message);
  if (request.emailEnabled && request.email && process.env.RESEND_API_KEY) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `${request.tagCode}-${Date.now()}-email`,
        },
        body: JSON.stringify({
          from:
            process.env.NOTIFICATION_FROM_EMAIL ||
            "NamTek Recovery <onboarding@resend.dev>",
          to: [request.email],
          subject: `New message about luggage tag ${request.tagCode}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>New NamTek recovery message</h2><p>${clean(request.senderLabel)} sent a message about tag <strong>${clean(request.tagCode)}</strong>:</p><blockquote style="border-left:4px solid #2463eb;padding:12px 16px;background:#eef4ff">${snippet}</blockquote><p><a href="${request.conversationUrl}" style="display:inline-block;background:#2463eb;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Open private conversation</a></p><p style="color:#777;font-size:12px">For privacy, the full conversation is available only through the secure link.</p></div>`,
        }),
      }).then(async (response) => {
        if (!response.ok)
          throw new Error(
            `Resend ${response.status}: ${await response.text()}`,
          );
      }),
    );
  }
  if (
    request.smsEnabled &&
    request.phone &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    const params = new URLSearchParams({
      To: request.phone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `NamTek: New message about tag ${request.tagCode}. Open your dashboard: ${request.conversationUrl}`,
    });
    tasks.push(
      fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        },
      ).then(async (response) => {
        if (!response.ok)
          throw new Error(
            `Twilio ${response.status}: ${await response.text()}`,
          );
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  for (const result of results)
    if (result.status === "rejected")
      console.error("NamTek notification delivery failed", result.reason);
}
