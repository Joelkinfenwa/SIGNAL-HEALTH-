"use server";

import { getProduct } from "@/config/products";
import { postPurchaseOffer, retestOffers } from "@/config/retest-offer";
import { recordServerEvent } from "@/lib/analytics/server";
import { decodeOrderMetadata } from "@/lib/orders/metadata";
import { orderTokenSecret, verifyOrderToken } from "@/lib/orders/token";
import { addMonths, offerDeadline, quoteRetestForOrder } from "@/lib/retest/offer";
import { getStripe } from "@/lib/stripe/server";
import { createHash } from "node:crypto";

/**
 * Accept / decline the post-purchase Automatic Retesting offer
 * (docs/ARCHITECTURE.md §7). Order of operations is the safety rule:
 * subscription FIRST, refund SECOND. Never refund unless the subscription
 * exists. Both calls are idempotent on the order id, so a retry cannot
 * double-enrol or double-refund.
 *
 * Until a database exists, the consent record lives in the subscription's
 * metadata (offer id/version, consent text version + hash, amounts) and the
 * PaymentIntent is tagged with the enrolment so the order page shows it.
 */
export type AcceptResult =
  | { status: "invalid"; reason: string }
  | { status: "not_configured"; reason: string }
  | { status: "already_enrolled"; nextTestDate: string }
  | { status: "expired" }
  | { status: "accepted"; enrolmentId: string; refundCents: number; recurringCents: number; nextTestDate: string; refundPending: boolean };

interface Input { orderId: string; token: string; offerId: string; offerVersion: number; consentTextVersion: string; consentAccepted: boolean }

const consentHash = () => createHash("sha256").update([postPurchaseOffer.consentLabel, ...postPurchaseOffer.disclosure, postPurchaseOffer.cancellationLine[postPurchaseOffer.cancellationPolicy], postPurchaseOffer.refundTiming].join("\n")).digest("hex").slice(0, 16);

export async function acceptRetestOffer(input: Input): Promise<AcceptResult> {
  const offer = retestOffers.find((o) => o.id === input.offerId && o.version === input.offerVersion && o.active);
  if (!offer) return { status: "invalid", reason: "That plan is no longer available." };
  if (!input.consentAccepted || input.consentTextVersion !== postPurchaseOffer.consentTextVersion) return { status: "invalid", reason: "Please confirm you understand the recurring billing." };
  if (input.orderId === "demo") return { status: "not_configured", reason: "This is a preview order, so nothing is charged or refunded." };
  if (!verifyOrderToken(input.orderId, input.token, orderTokenSecret())) return { status: "invalid", reason: "This order link is not valid." };
  const stripe = getStripe();
  if (!stripe) return { status: "not_configured", reason: "Payments are not connected yet." };

  const pi = await stripe.paymentIntents.retrieve(input.orderId, { expand: ["latest_charge"] });
  if (pi.status !== "succeeded") return { status: "invalid", reason: "This order has not been paid yet." };
  if (pi.metadata.retest_subscription) return { status: "already_enrolled", nextTestDate: new Date(Number(pi.metadata.retest_next_test) * 1000).toISOString() };
  if (Date.now() > offerDeadline(new Date(pi.created * 1000), postPurchaseOffer.windowHours).getTime()) return { status: "expired" };
  const decoded = decodeOrderMetadata(pi.metadata);
  const product = decoded ? getProduct(decoded.configuration.productId) : undefined;
  if (!decoded || !product) return { status: "invalid", reason: "This order can't be enrolled." };
  const customerId = typeof pi.customer === "string" ? pi.customer : pi.customer?.id;
  const paymentMethod = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id;
  if (!customerId || !paymentMethod) return { status: "invalid", reason: "No saved payment method on this order." };

  const lines = decoded.lines.map((l) => ({ ...l, label: l.id }));
  const q = quoteRetestForOrder(lines, offer);
  const nextTest = addMonths(new Date(pi.created * 1000), offer.intervalMonths);
  const trialEnd = Math.max(Math.floor(nextTest.getTime() / 1000), Math.floor(Date.now() / 1000) + 3600);

  // 1. Subscription first. Price is created inline against a single catalogue product per plan.
  const stripeProduct = await ensureRetestProduct(stripe, offer.id, `Automatic Retesting · ${product.name} · ${offer.cadence}`);
  const sub = await stripe.subscriptions.create(
    {
      customer: customerId,
      default_payment_method: paymentMethod,
      items: [{ price_data: { currency: "aud", product: stripeProduct, unit_amount: q.recurringPriceCents, recurring: { interval: "month", interval_count: offer.intervalMonths } } }],
      trial_end: trialEnd,
      proration_behavior: "none",
      payment_behavior: "default_incomplete",
      metadata: {
        origin_order: pi.id, offer_id: offer.id, offer_version: String(offer.version), product_id: product.id, addon_ids: decoded.configuration.addonIds.join(","),
        consent_version: input.consentTextVersion, consent_hash: consentHash(), consent_at: new Date().toISOString(),
        refund_cents: String(q.refundTodayCents), recurring_cents: String(q.recurringPriceCents), cancellation_policy: postPurchaseOffer.cancellationPolicy,
      },
    },
    { idempotencyKey: `retest-sub-${pi.id}` },
  );

  // 2. Then the refund. If this throws, the enrolment stands and a retry completes it.
  let refundPending = false;
  if (q.refundTodayCents > 0) {
    try {
      await stripe.refunds.create({ payment_intent: pi.id, amount: q.refundTodayCents, metadata: { reason: "retest_conversion", subscription: sub.id, offer_id: offer.id } }, { idempotencyKey: `retest-refund-${pi.id}` });
    } catch {
      refundPending = true;
    }
  }

  await stripe.paymentIntents.update(pi.id, {
    metadata: { retest_subscription: sub.id, retest_offer_id: offer.id, retest_next_test: String(trialEnd), retest_refund_cents: String(q.refundTodayCents), retest_refund_pending: refundPending ? "1" : "0", retest_offer_outcome: "accepted" },
  });
  await recordServerEvent("retest_offer_accepted", `${pi.id}:retest`, { order_id: pi.id, offer_id: offer.id, offer_version: offer.version, value: q.recurringPriceCents / 100, currency: "AUD" });

  return { status: "accepted", enrolmentId: sub.id, refundCents: q.refundTodayCents, recurringCents: q.recurringPriceCents, nextTestDate: new Date(trialEnd * 1000).toISOString(), refundPending };
}

export async function declineRetestOffer(input: { orderId: string; token: string; offerId: string; offerVersion: number }): Promise<{ status: "recorded" }> {
  const stripe = getStripe();
  if (stripe && input.orderId.startsWith("pi_") && verifyOrderToken(input.orderId, input.token, orderTokenSecret())) {
    try { await stripe.paymentIntents.update(input.orderId, { metadata: { retest_offer_outcome: "declined", retest_offer_id: input.offerId } }); } catch { /* best effort */ }
  }
  return { status: "recorded" };
}

async function ensureRetestProduct(stripe: NonNullable<ReturnType<typeof getStripe>>, offerId: string, name: string): Promise<string> {
  const found = await stripe.products.search({ query: `metadata['signal_offer_id']:'${offerId}'`, limit: 1 });
  if (found.data[0]) return found.data[0].id;
  const created = await stripe.products.create({ name, metadata: { signal_offer_id: offerId } }, { idempotencyKey: `retest-product-${offerId}` });
  return created.id;
}
