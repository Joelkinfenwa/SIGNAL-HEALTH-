import "server-only";
import Stripe from "stripe";

/** Server-side Stripe client. Never import from a client component. */
let client: Stripe | null = null;
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key, { apiVersion: "2025-08-27.basil", appInfo: { name: "SIGNAL by Express Pathology", url: process.env.NEXT_PUBLIC_SITE_URL } });
  return client;
}
export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const stripeTestMode = () => (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
