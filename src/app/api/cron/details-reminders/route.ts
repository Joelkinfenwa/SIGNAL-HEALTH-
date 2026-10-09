import { NextResponse } from "next/server";
import { completeDetailsEmail } from "@/lib/email/complete-details";
import { sendEmail } from "@/lib/email/send";
import { orderTokenSecret, signOrderToken } from "@/lib/orders/token";
import { orderReference } from "@/lib/pathology/intent-input";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

/**
 * Hourly (vercel.json): paid orders still waiting on laboratory details after
 * 24 hours get one reminder email. Vercel calls this with
 * `Authorization: Bearer <CRON_SECRET>`; anything else is refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Not configured" }, { status: 501 });

  const cutoff = Math.floor(Date.now() / 1000) - 24 * 3600;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const found = await stripe.paymentIntents.search({ query: `status:'succeeded' AND metadata['request_form']:'held:details_pending' AND created<${cutoff}`, limit: 100 });
  let sent = 0, skipped = 0;
  for (const pi of found.data) {
    if (pi.metadata.details_reminder_sent) { skipped++; continue; }
    const to = pi.receipt_email;
    if (!to) { skipped++; continue; }
    const token = encodeURIComponent(signOrderToken(pi.id, orderTokenSecret()));
    const mail = completeDetailsEmail({ reference: orderReference(pi), orderUrl: `${site}/order/${pi.id}?t=${token}`, amountCents: pi.amount_received || pi.amount, reminder: true });
    const r = await sendEmail({ to, ...mail });
    await stripe.paymentIntents.update(pi.id, { metadata: { details_reminder_sent: r.sent ? (r.id ?? "1") : "skipped" } }).catch(() => undefined);
    sent++;
  }
  return NextResponse.json({ checked: found.data.length, sent, skipped });
}
