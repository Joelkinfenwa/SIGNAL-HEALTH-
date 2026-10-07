import "server-only";
import type Stripe from "stripe";
import { dbConfigured, ensureSchema, sql } from "@/lib/db";
import { orderReference } from "@/lib/pathology/intent-input";

/**
 * Sequential order numbers (#2050, #2051, …), assigned once per paid
 * PaymentIntent and recorded on it as metadata.order_number so every
 * consumer (form, emails, order page) reads the same value.
 *
 * Idempotent: the orders table is keyed on the payment intent, so the
 * webhook and the order page can both call this and get the same number.
 * Without a database the reference falls back to the Stripe-derived code.
 */
export async function assignOrderNumber(paymentIntentId: string): Promise<number | null> {
  const q = sql();
  if (!q) return null;
  await ensureSchema();
  const existing = await q`SELECT number FROM orders WHERE payment_intent = ${paymentIntentId}`;
  if (existing[0]) return Number(existing[0].number);
  const inserted = await q`INSERT INTO orders (number, payment_intent) VALUES (nextval('order_number'), ${paymentIntentId}) ON CONFLICT (payment_intent) DO NOTHING RETURNING number`;
  if (inserted[0]) return Number(inserted[0].number);
  const again = await q`SELECT number FROM orders WHERE payment_intent = ${paymentIntentId}`;
  return again[0] ? Number(again[0].number) : null;
}

type PiLike = Pick<Stripe.PaymentIntent, "id" | "metadata">;

/**
 * Returns the customer-facing reference for a paid order, assigning and
 * persisting the sequential number on first use. Mutates pi.metadata so the
 * caller's copy carries the number too.
 */
export async function ensureOrderReference(stripe: Stripe | null, pi: PiLike): Promise<string> {
  if (pi.metadata?.order_number) return orderReference(pi);
  if (!dbConfigured()) return orderReference(pi);
  try {
    const n = await assignOrderNumber(pi.id);
    if (n === null) return orderReference(pi);
    pi.metadata = { ...(pi.metadata ?? {}), order_number: String(n) };
    if (stripe) await stripe.paymentIntents.update(pi.id, { metadata: { order_number: String(n) } }).catch(() => undefined);
    return orderReference(pi);
  } catch (err) {
    console.warn("[order-number] assignment failed; using fallback reference", (err as Error).message);
    return orderReference(pi);
  }
}
