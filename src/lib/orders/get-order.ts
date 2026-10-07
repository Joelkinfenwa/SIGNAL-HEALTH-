import "server-only";

import { getAddon } from "@/config/addons";
import { getCollectionMethod } from "@/config/collection";
import { getProduct, signalTest } from "@/config/products";
import { decodeOrderMetadata } from "@/lib/orders/metadata";
import { orderTokenSecret, verifyOrderToken } from "@/lib/orders/token";
import { quoteConfiguration, parseConfiguration, type Configuration, type QuoteLine } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe/server";
import { ensureOrderReference } from "@/lib/orders/number";

/**
 * What the confirmation page needs about an order, read from Stripe (the
 * order store until a database exists). The link must carry a valid signed
 * token (?t=); the order id alone never grants access. Payment status comes
 * from the PaymentIntent, never from the URL.
 *
 * Previews can open /order/demo?addons=…&collection=… with clearly labelled
 * illustrative amounts. Production returns nothing for it.
 */
export interface OrderView {
  id: string;
  token: string;
  /** Short reference shown to the customer. */
  reference: string;
  status: "paid" | "processing" | "partially_refunded";
  configuration: Configuration;
  lines: QuoteLine[];
  amountCents: number;
  currency: "AUD";
  paidAt: Date;
  firstName?: string;
  emailMasked?: string;
  /** Set once Automatic Retesting has been accepted for this order. */
  retest?: { offerId: string; nextTestDate: Date; refundCents: number };
  /** Preview-only illustrative order. */
  demo: boolean;
}

const DEMO_ALLOWED = () => process.env.VERCEL_ENV !== "production";
/** Illustrative amounts for the demo order only, never shown as real prices. TODO(pricing) */
const DEMO_PRICES = { product: 34900, addon: 5900, mobile: 4900 };

const maskEmail = (e?: string | null) => (e ? `${e[0]}•••@${e.split("@")[1] ?? ""}` : undefined);

function labelFor(kind: QuoteLine["kind"], id: string): string {
  if (kind === "product") return getProduct(id)?.name ?? "The SIGNAL Test";
  if (kind === "addon") return getAddon(id)?.name ?? id;
  return id === "centre" || id === "mobile" ? getCollectionMethod(id).name : id;
}

export async function getOrderForPage(orderId: string, searchParams: Record<string, string | string[] | undefined>): Promise<OrderView | null> {
  if (orderId === "demo" && DEMO_ALLOWED()) {
    const cfg = parseConfiguration(searchParams, signalTest);
    if (!cfg.collectionMethodId) cfg.collectionMethodId = "centre";
    const q = quoteConfiguration(cfg);
    const lines = q.lines.map((l) => ({
      ...l,
      priceCents: l.priceCents ?? (l.kind === "product" ? DEMO_PRICES.product : l.kind === "addon" ? DEMO_PRICES.addon : l.id === "mobile" ? DEMO_PRICES.mobile : 0),
    }));
    return {
      id: "demo", token: "demo", reference: "#2050", status: "paid", configuration: cfg, lines,
      amountCents: lines.reduce((n, l) => n + (l.priceCents ?? 0), 0), currency: "AUD", paidAt: new Date(),
      firstName: "Sam", emailMasked: "s•••@example.com", demo: true,
    };
  }

  if (!orderId.startsWith("pi_")) return null;
  const token = typeof searchParams.t === "string" ? searchParams.t : undefined;
  if (!verifyOrderToken(orderId, token, orderTokenSecret())) return null;
  const stripe = getStripe();
  if (!stripe) return null;

  let pi;
  try {
    pi = await stripe.paymentIntents.retrieve(orderId, { expand: ["customer", "latest_charge"] });
  } catch {
    return null;
  }
  if (pi.status !== "succeeded" && pi.status !== "processing") return null;
  const decoded = decodeOrderMetadata(pi.metadata);
  if (!decoded) return null;
  const reference = pi.status === "succeeded" ? await ensureOrderReference(stripe, pi) : `SIG-${pi.id.replace(/^pi_/, "").slice(-8).toUpperCase()}`;

  const customer = pi.customer && typeof pi.customer !== "string" && !("deleted" in pi.customer && pi.customer.deleted) ? pi.customer : null;
  const charge = pi.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
  const refunded = (charge?.amount_refunded ?? 0) > 0;
  const retest = pi.metadata.retest_subscription
    ? { offerId: pi.metadata.retest_offer_id ?? "", nextTestDate: new Date(Number(pi.metadata.retest_next_test) * 1000), refundCents: Number(pi.metadata.retest_refund_cents ?? 0) }
    : undefined;

  return {
    id: pi.id,
    token: token!,
    reference,
    status: pi.status === "processing" ? "processing" : refunded ? "partially_refunded" : "paid",
    configuration: decoded.configuration,
    lines: decoded.lines.map((l) => ({ kind: l.kind, id: l.id, label: labelFor(l.kind, l.id), priceCents: l.priceCents })),
    amountCents: pi.amount,
    currency: "AUD",
    paidAt: new Date(pi.created * 1000),
    firstName: customer?.metadata?.first_name || customer?.name?.split(" ")[0] || undefined,
    emailMasked: maskEmail(customer?.email ?? pi.receipt_email),
    retest,
    demo: false,
  };
}
