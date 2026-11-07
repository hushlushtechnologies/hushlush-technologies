import { clientIp, field, isEmail, isPhone, json, rateLimited, sendMail, table, textBody } from "@/lib/server/mail";


export async function POST(req: Request) {
  if (rateLimited(`enquiry:${clientIp(req)}`)) return json({ error: "Too many submissions. Please try again in a few minutes." }, 429);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return json({ error: "The form could not be read." }, 400);
  }
  if (field(fd, "website_url")) return json({ ok: true }); // honeypot

  const name = field(fd, "name", 120);
  const email = field(fd, "email", 160);
  const phone = field(fd, "phone", 40);
  const company = field(fd, "company", 160);
  const website = field(fd, "website", 300);
  const service = field(fd, "service", 200);
  const message = field(fd, "message", 5000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPhone(phone)) errors.phone = "Please enter a valid phone or WhatsApp number.";
  if (Object.keys(errors).length) return json({ error: "Please check the highlighted fields.", errors }, 400);

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone / WhatsApp", phone],
    ["Company", company],
    ["Website", website],
    ["Service", service],
    ["Project details", message],
  ];

  try {
    await sendMail({
      to: process.env.ENQUIRY_TO || "marketing@hushlushtechnologies.com",
      subject: `New project enquiry — ${name}${company ? ` (${company})` : ""}`,
      html: table("New project enquiry", rows, "Reply to this email to contact the client."),
      text: textBody(rows),
      replyTo: email,
    });
  } catch (e) {
    console.error("[enquiry] send failed", e);
    // In development show the real reason (e.g. missing API key, unverified recipient) to make setup easy
    const dev = process.env.NODE_ENV !== "production";
    return json({ error: dev ? `Email not sent: ${(e as Error).message}` : "We couldn't send your enquiry right now. Please try again shortly." }, 502);
  }
  return json({ ok: true });
}
