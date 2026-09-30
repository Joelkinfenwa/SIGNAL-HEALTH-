import "server-only";

import { quoteConfiguration, parseConfiguration, type Configuration, type QuoteLine } from "@/lib/pricing";
import { signalTest } from "@/config/products";

/**
 * What the confirmation page needs about an order. Read from our database
 * (written by the Stripe webhook) once payments exist; the order id alone
 * never grants access — the link carries a signed, short-lived token.
 *
 * Until then, previews can open /order/demo?addons=…&collection=… to walk
 * the page with clearly labelled illustrative amounts. Production returns
 * nothing for it.
 */
export interface OrderView {
  id: string;
  /** Short reference shown to the customer. */
  reference: string;
  status: "paid" | "partially_refunded";
  configuration: Configuration;
  lines: QuoteLine[];
  amountCents: number;
  currency: "AUD";
  paidAt: Date;
  firstName?: string;
  emailMasked?: string;
  /** Preview-only illustrative order. */
  demo: boolean;
}

const DEMO_ALLOWED = () => process.env.VERCEL_ENV !== "production";
/** Illustrative amounts for the demo order only, never shown as real prices. TODO(pricing) */
const DEMO_PRICES = { product: 34900, addon: 5900, mobile: 4900 };

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
      id: "demo",
      reference: "SIG-DEMO-0001",
      status: "paid",
      configuration: cfg,
      lines,
      amountCents: lines.reduce((n, l) => n + (l.priceCents ?? 0), 0),
      currency: "AUD",
      paidAt: new Date(),
      firstName: "Sam",
      emailMasked: "s•••@example.com",
      demo: true,
    };
  }
  // TODO(phase 6): verify the signed token, load the order, require status paid.
  return null;
}
