"use server";

/**
 * Checkout boundary: the ONLY place the browser hands a configuration and
 * customer details to the server.
 *
 *  1. Re-validate the customer and re-quote the configuration server-side;
 *     never trust an amount from the client.
 *  2. Create the Stripe Customer (contact + identity facts for the lab) and a
 *     PaymentIntent (AUD, Payment Element, card saved off-session for
 *     Automatic Retesting) carrying the configuration, snapshotted line
 *     prices and first-party attribution in metadata.
 *  3. Return the client secret and a signed order token for the confirmation page.
 *
 * Stripe is the order store until a database exists (docs/ARCHITECTURE.md §5).
 */
import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { detailsCopy } from "@/config/checkout-fields";
import { PREVIEW_PRICING } from "@/config/pricing";
import { normaliseCustomer, validateCustomer, type CustomerDetails } from "@/lib/checkout/customer";
import { legalEntity } from "@/config/legal/entity";
import { gaClientIdFromCookie } from "@/lib/analytics/server-adapters";
import { customerParams, encodeOrderMetadata, type OrderContext } from "@/lib/orders/metadata";
import { orderTokenSecret, signOrderToken } from "@/lib/orders/token";
import { quoteConfiguration, type Configuration } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe/server";

export type CreateOrderResult =
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "not_configured"; reason: string }
  | { status: "ready"; orderId: string; clientSecret: string; amountCents: number; token: string };

async function readContext(): Promise<OrderContext> {
  const jar = await cookies();
  const parse = <T,>(name: string): T | undefined => {
    const raw = jar.get(name)?.value;
    if (!raw) return undefined;
    try { return JSON.parse(decodeURIComponent(raw)) as T; } catch { return undefined; }
  };
  const ctx = parse<{ lp_slug?: string; experiment_id?: string; variant?: string }>("sig_ctx") ?? {};
  const attr = parse<{ first?: OrderContext["first"]; last?: OrderContext["last"] }>("sig_attr") ?? {};
  return { ...ctx, first: attr.first, last: attr.last, fbp: jar.get("_fbp")?.value, fbc: jar.get("_fbc")?.value, ga_cid: gaClientIdFromCookie(jar.get("_ga")?.value) ?? undefined };
}

export async function createOrder(cfg: Configuration, customer: CustomerDetails): Promise<CreateOrderResult> {
  const errors = validateCustomer(customer, { requiresAddress: true }, detailsCopy.errors);
  if (Object.keys(errors).length) return { status: "invalid", errors };
  if (!cfg.collectionMethodId) return { status: "invalid", errors: { collection: "Choose a collection option." } };

  const quote = quoteConfiguration(cfg);
  if (!quote.pricingComplete || quote.totalCents === null) return { status: "not_configured", reason: "Pricing is not set yet." };
  if (PREVIEW_PRICING && process.env.VERCEL_ENV === "production") return { status: "not_configured", reason: "Preview pricing cannot be used in production." };
  const stripe = getStripe();
  if (!stripe) return { status: "not_configured", reason: "Payments are not connected yet." };

  const record = normaliseCustomer(customer);
  const eventId = randomUUID();
  const ctx = await readContext();

  const h = await headers();
  const stripeCustomer = await stripe.customers.create({ ...customerParams(record), metadata: { ...customerParams(record).metadata, order_ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "", order_ua: (h.get("user-agent") ?? "").slice(0, 200) } });
  const intent = await stripe.paymentIntents.create(
    {
      amount: quote.totalCents,
      currency: "aud",
      customer: stripeCustomer.id,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      receipt_email: record.email,
      description: `${quote.lines.map((l) => l.label).join(" + ")}`,
      statement_descriptor_suffix: "SIGNAL",
      metadata: encodeOrderMetadata(cfg, quote.lines, ctx, eventId),
    },
    { idempotencyKey: `pi-${eventId}` },
  );
  if (!intent.client_secret) return { status: "not_configured", reason: "Payment could not be started." };
  return { status: "ready", orderId: intent.id, clientSecret: intent.client_secret, amountCents: quote.totalCents, token: signOrderToken(intent.id, orderTokenSecret()) };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Pay-first checkout: start a payment with the configuration and an email
 * address only. The Customer is created with `details_status: pending`; the
 * laboratory details are collected on the order page after payment
 * (lib/checkout/complete-details.ts) and the request form is issued then.
 * Paying is acceptance of the terms shown beside the pay button; the version
 * and time are recorded on the Customer.
 */
export async function startPayment(cfg: Configuration, email: string): Promise<CreateOrderResult> {
  const addr = email.trim().toLowerCase();
  if (!EMAIL.test(addr)) return { status: "invalid", errors: { email: detailsCopy.errors.email } };
  if (!cfg.collectionMethodId) return { status: "invalid", errors: { collection: "Choose a collection option." } };

  const quote = quoteConfiguration(cfg);
  if (!quote.pricingComplete || quote.totalCents === null) return { status: "not_configured", reason: "Pricing is not set yet." };
  if (PREVIEW_PRICING && process.env.VERCEL_ENV === "production") return { status: "not_configured", reason: "Preview pricing cannot be used in production." };
  const stripe = getStripe();
  if (!stripe) return { status: "not_configured", reason: "Payments are not connected yet." };

  const eventId = randomUUID();
  const ctx = await readContext();
  const h = await headers();
  const stripeCustomer = await stripe.customers.create({
    email: addr,
    metadata: {
      details_status: "pending",
      consent_terms: "1", consent_terms_version: legalEntity.lastUpdated, consent_terms_at: new Date().toISOString(),
      order_ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "", order_ua: (h.get("user-agent") ?? "").slice(0, 200),
    },
  });
  const intent = await stripe.paymentIntents.create(
    {
      amount: quote.totalCents,
      currency: "aud",
      customer: stripeCustomer.id,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      receipt_email: addr,
      description: `${quote.lines.map((l) => l.label).join(" + ")}`,
      statement_descriptor_suffix: "SIGNAL",
      metadata: encodeOrderMetadata(cfg, quote.lines, ctx, eventId),
    },
    { idempotencyKey: `pi-${eventId}` },
  );
  if (!intent.client_secret) return { status: "not_configured", reason: "Payment could not be started." };
  return { status: "ready", orderId: intent.id, clientSecret: intent.client_secret, amountCents: quote.totalCents, token: signOrderToken(intent.id, orderTokenSecret()) };
}
