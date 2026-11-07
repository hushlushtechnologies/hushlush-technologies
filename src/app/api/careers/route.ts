import { clientIp, field, isEmail, isPhone, json, rateLimited, sendMail, table, textBody } from "@/lib/server/mail";


// Vercel caps a request at ~4.5 MB, so keep the resume a bit under that.
const MAX_BYTES = 4 * 1024 * 1024;

/** Detect the real file type from its first bytes (not from the name). */
function detect(buf: Buffer): "pdf" | "docx" | "doc" | null {
  if (buf.subarray(0, 4).toString("latin1") === "%PDF") return "pdf";
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return "docx"; // zip container
  if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return "doc";
  return null;
}

export async function POST(req: Request) {
  if (rateLimited(`careers:${clientIp(req)}`)) return json({ error: "Too many submissions. Please try again in a few minutes." }, 429);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return json({ error: "The form could not be read — the file may be too large (max 4 MB)." }, 413);
  }

  // Honeypot: real visitors never fill this hidden field
  if (field(fd, "website_url")) return json({ ok: true });

  const name = field(fd, "name", 120);
  const email = field(fd, "email", 160);
  const phone = field(fd, "phone", 40);
  const role = field(fd, "role", 120) || "General Application";
  const message = field(fd, "message", 4000);
  const resume = fd.get("resume");

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPhone(phone)) errors.phone = "Please enter a valid phone number.";
  if (!(resume instanceof File) || resume.size === 0) errors.resume = "Please upload your resume.";
  else if (resume.size > MAX_BYTES) errors.resume = "Resume must be 4 MB or smaller.";
  if (Object.keys(errors).length) return json({ error: "Please check the highlighted fields.", errors }, 400);

  const file = resume as File;
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = detect(buf);
  if (!kind) return json({ error: "Resume must be a PDF or Word document.", errors: { resume: "Resume must be a PDF or Word document." } }, 400);

  const safeName = `${name.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "applicant"}-resume.${kind}`;
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone],
    ["Applying for", role],
    ["Message", message],
  ];

  try {
    await sendMail({
      to: process.env.CAREERS_TO || "careers@hushlushtechnologies.com",
      subject: `New application — ${role} — ${name}`,
      html: table(`New job application: ${role}`, rows, "Resume attached. Reply to this email to contact the applicant."),
      text: textBody(rows),
      replyTo: email,
      attachments: [{ filename: safeName, content: buf.toString("base64") }],
    });
  } catch (e) {
    console.error("[careers] send failed", e);
    // In development show the real reason (e.g. missing API key, unverified recipient) to make setup easy
    const dev = process.env.NODE_ENV !== "production";
    return json({ error: dev ? `Email not sent: ${(e as Error).message}` : "We couldn't send your application right now. Please try again shortly." }, 502);
  }
  return json({ ok: true });
}
