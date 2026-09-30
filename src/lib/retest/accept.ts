"use server";

import { postPurchaseOffer, retestOffers } from "@/config/retest-offer";

/**
 * Accept / decline the post-purchase Automatic Retesting offer.
 * Contract (docs/ARCHITECTURE.md §7): verify the order token and that the
 * order is paid with no enrolment; insert enrolment (pending) + consent
 * record in one transaction; create the Stripe subscription with the first
 * charge deferred one interval; only then issue the partial refund; mark
 * active. Never refund unless the subscription exists.
 */
export type AcceptResult =
  | { status: "invalid"; reason: string }
  | { status: "not_configured"; reason: string }
  | { status: "accepted"; enrolmentId: string; refundCents: number; nextTestDate: string };

export async function acceptRetestOffer(input: { orderId: string; offerId: string; offerVersion: number; consentTextVersion: string; consentAccepted: boolean }): Promise<AcceptResult> {
  const offer = retestOffers.find((o) => o.id === input.offerId && o.version === input.offerVersion && o.active);
  if (!offer) return { status: "invalid", reason: "That plan is no longer available." };
  if (!input.consentAccepted || input.consentTextVersion !== postPurchaseOffer.consentTextVersion) return { status: "invalid", reason: "Please confirm you understand the recurring billing." };
  if (!process.env.STRIPE_SECRET_KEY) return { status: "not_configured", reason: "Payments are not connected yet." };
  // TODO(phase 6): token check, enrolment + consent insert, subscription, refund.
  return { status: "not_configured", reason: "Retesting enrolment is not connected yet." };
}

export async function declineRetestOffer(input: { orderId: string; offerId: string; offerVersion: number }): Promise<{ status: "recorded" }> {
  void input; // TODO(phase 6): record offer_exposure outcome = declined.
  return { status: "recorded" };
}
