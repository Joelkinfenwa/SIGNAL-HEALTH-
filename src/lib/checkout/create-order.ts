"use server";

/**
 * Checkout boundary (phase 6). This is the ONLY place the browser hands a
 * configuration to the server. Nothing here talks to Stripe yet; the shape
 * is what the Stripe implementation will fill in.
 *
 * Contract when implemented (docs/ARCHITECTURE.md §6):
 *  1. Re-quote the configuration server-side with quoteConfiguration();
 *     never trust an amount from the client.
 *  2. Create the order (pending_payment) with snapshotted line prices and
 *     the attribution + landing-page context.
 *  3. Create a Stripe PaymentIntent (AUD, setup_future_usage: off_session,
 *     metadata { order_id, lp_slug, utm_campaign, creator }) and return its
 *     client_secret for the Payment Element / Express Checkout Element.
 *  4. The webhook (payment_intent.succeeded) marks the order paid and emits
 *     the server-authoritative purchase event with event_id = order id.
 */
import { quoteConfiguration, type Configuration } from "@/lib/pricing";

export type CreateOrderResult =
  | { status: "not_configured"; reason: string; quote: ReturnType<typeof quoteConfiguration> }
  | { status: "ready"; orderId: string; clientSecret: string; amountCents: number };

export async function createOrder(cfg: Configuration): Promise<CreateOrderResult> {
  const quote = quoteConfiguration(cfg);
  if (!quote.pricingComplete) {
    return { status: "not_configured", reason: "Pricing is not set yet.", quote };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: "not_configured", reason: "Payments are not connected yet.", quote };
  }
  // TODO(phase 6): persist order, create PaymentIntent, return client secret.
  return { status: "not_configured", reason: "Payment provider integration pending.", quote };
}
