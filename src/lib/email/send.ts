import "server-only";

/**
 * Transactional email through Resend's HTTP API (no SDK). Configured by
 * RESEND_API_KEY and EMAIL_FROM. Without them, sends are logged and skipped
 * so previews never email anyone.
 */
export interface EmailAttachment { filename: string; content: Uint8Array }
export async function sendEmail(input: { to: string; subject: string; html: string; text: string; replyTo?: string; attachments?: EmailAttachment[] }): Promise<{ sent: boolean; id?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) { console.info("[email] skipped (not configured)", input.to, input.subject); return { sent: false }; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from, to: [input.to], subject: input.subject, html: input.html, text: input.text, reply_to: input.replyTo,
      attachments: input.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString("base64") })),
    }),
  });
  if (!res.ok) { console.warn("[email] failed", res.status, await res.text()); return { sent: false }; }
  const data = (await res.json()) as { id?: string };
  return { sent: true, id: data.id };
}
