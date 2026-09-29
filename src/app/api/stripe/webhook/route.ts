import { NextResponse } from "next/server";

/**
 * Stripe webhook endpoint (phase 2). Requirements when implemented:
 *  - Read the raw body and verify the signature with STRIPE_WEBHOOK_SECRET.
 *  - De-duplicate on event.id (stripe_event table) — Stripe retries.
 *  - Handle: payment_intent.succeeded, charge.refunded, invoice.upcoming,
 *    invoice.paid, invoice.payment_failed, customer.subscription.updated/deleted.
 *  - Emit server-authoritative analytics (purchase_completed etc.).
 */
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
