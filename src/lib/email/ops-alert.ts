import "server-only";
import { sendEmail } from "./send";

/**
 * Operational alert for things a human must look at (a paid order whose
 * request form could not be issued). Always logged; emailed when
 * OPS_ALERT_EMAIL is set. Never throws: an alert failure must not fail the
 * webhook that raised it.
 */
export async function opsAlert(subject: string, body: string): Promise<void> {
  console.error(`[ops-alert] ${subject}: ${body}`);
  const to = process.env.OPS_ALERT_EMAIL;
  if (!to) return;
  try { await sendEmail({ to, subject: `[SIGNAL ops] ${subject}`, text: body, html: `<pre style="font-family:monospace;white-space:pre-wrap">${body.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>` }); } catch (err) { console.error("[ops-alert] send failed", err); }
}
