import "server-only";
import { walkIn } from "@/config/booking";
import { formatAUD } from "@/lib/money";
import { sendEmail } from "./send";

/**
 * Internal copy of every paid order, sent to ORDER_NOTIFY_EMAIL (falls back
 * to OPS_ALERT_EMAIL). This is the operations record until the orders
 * dashboard exists: who ordered, what, how they are being collected, and the
 * request form as attached. Home visits say so in the subject because the
 * team has to call the customer.
 */
export interface OrderNotification {
  reference: string;
  orderId: string;
  stripeUrl: string;
  paidAt: Date;
  amountCents: number;
  lines: { label: string; priceCents: number }[];
  collectionLabel: string;
  isMobile: boolean;
  patient: { name: string; email: string; phone: string; dob: string; sex: string; address: string };
  formStatus: string;
  form: Uint8Array | null;
  retestPlan?: string;
}

export async function sendOrderNotification(n: OrderNotification): Promise<void> {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.OPS_ALERT_EMAIL;
  if (!to) return;
  const when = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Sydney" }).format(n.paidAt);
  const action = n.isMobile ? `ACTION: home/workplace visit. Call the customer within ${walkIn.mobile.callWithin} to arrange a time.` : "Walk-in collection: no action needed unless the form is held.";
  const held = n.formStatus !== "attached" ? `ACTION: request form ${n.formStatus}. The customer has NOT received a form. Fix and send manually.` : "";
  const lines = [
    `New order ${n.reference} · ${when}`,
    "",
    action, held, "",
    "Patient",
    `  ${n.patient.name}`,
    `  DOB ${n.patient.dob} · ${n.patient.sex}`,
    `  ${n.patient.email} · ${n.patient.phone}`,
    `  ${n.patient.address}`,
    "",
    "Order",
    ...n.lines.map((l) => `  ${l.label}  ${formatAUD(l.priceCents)}`),
    `  Paid  ${formatAUD(n.amountCents)}`,
    `  Collection: ${n.collectionLabel}`,
    n.retestPlan ? `  Automatic Retesting: ${n.retestPlan}` : "",
    `  Request form: ${n.formStatus}`,
    "",
    `Stripe: ${n.stripeUrl}`,
  ].filter((l) => l !== "" || true).filter((l, i, a) => !(l === "" && a[i - 1] === ""));
  const text = lines.join("\n");
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  const subject = `${n.isMobile ? "HOME VISIT · " : ""}${held ? "FORM HELD · " : ""}New order ${n.reference} · ${n.patient.name} · ${n.collectionLabel}`;
  try {
    await sendEmail({
      to, subject, text,
      html: `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap;line-height:1.5">${esc(text).replace(/(ACTION:[^\n]*)/g, '<b style="color:#c8102e">$1</b>')}</pre>`,
      attachments: n.form ? [{ filename: `SIGNAL-request-${n.reference}.pdf`, content: n.form }] : undefined,
    });
  } catch (err) {
    console.error("[order-notification] failed", err);
  }
}
