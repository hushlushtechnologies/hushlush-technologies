/**
 * Tiny Resend client (REST API, no extra package).
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables, and .env.local):
 *   RESEND_API_KEY  – from resend.com → API Keys
 *   MAIL_FROM       – sender. Until hushlushtechnologies.com is verified in Resend, keep
 *                     "Hush Lush Website <onboarding@resend.dev>" (the default). After verifying,
 *                     use e.g. "Hush Lush Website <website@hushlushtechnologies.com>".
 *   CAREERS_TO      – inbox for job applications (comma-separate for several)
 *   ENQUIRY_TO      – inbox for project enquiries (comma-separate for several)
 *
 * NOTE: while the domain is NOT verified, Resend only delivers to the email address of the
 * Resend account itself — so CAREERS_TO / ENQUIRY_TO must be that address during testing.
 */

export type Attachment = { filename: string; content: string /* base64 */ };

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string; attachments?: Attachment[] }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const from = process.env.MAIL_FROM || "Hush Lush Website <onboarding@resend.dev>";

  const res = await fetch(`${process.env.RESEND_API_URL || "https://api.resend.com"}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: opts.to.split(",").map((s) => s.trim()).filter(Boolean),
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
      attachments: opts.attachments,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

/* ───────────── helpers shared by the form routes ───────────── */

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const field = (fd: FormData, name: string, max = 200) => String(fd.get(name) ?? "").trim().slice(0, max);

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v: string) => /^\+?\d{7,15}$/.test(v.replace(/[\s()-]/g, ""));

/** Email body: a simple branded table of label → value rows */
export function table(title: string, rows: [string, string][], note?: string) {
  const tr = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 14px;color:#8a7fa0;font:13px Arial;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee">${esc(k)}</td><td style="padding:10px 14px;color:#111;font:14px Arial;border-bottom:1px solid #eee;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<div style="background:#f6f4f9;padding:24px"><div style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(90deg,#62229D,#B72BCA,#E96ED8);padding:18px 22px;color:#fff;font:bold 18px Arial">${esc(title)}</div>
<table style="width:100%;border-collapse:collapse">${tr}</table>
${note ? `<p style="padding:14px 22px;color:#8a7fa0;font:12px Arial">${esc(note)}</p>` : ""}
</div></div>`;
}

export const textBody = (rows: [string, string][]) => rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");

/* Best-effort abuse protection (per server instance): max N submissions per IP per 10 minutes */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 6) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

export const json = (body: object, status = 200) => Response.json(body, { status });
