import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Order access token: HMAC of the order id. The confirmation link carries
 * it (?t=), so knowing or guessing an order id alone never reveals an order.
 * Secret: ORDER_TOKEN_SECRET (falls back to the Stripe secret key so a
 * missing variable fails closed rather than open — set it explicitly).
 */
export function signOrderToken(orderId: string, secret: string): string {
  return createHmac("sha256", secret).update(`order:${orderId}`).digest("base64url");
}

export function verifyOrderToken(orderId: string, token: string | undefined, secret: string): boolean {
  if (!token || !orderId) return false;
  const expected = Buffer.from(signOrderToken(orderId, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const orderTokenSecret = () => process.env.ORDER_TOKEN_SECRET ?? process.env.STRIPE_SECRET_KEY ?? "";
