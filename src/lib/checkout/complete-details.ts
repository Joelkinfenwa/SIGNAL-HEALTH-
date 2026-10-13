"use server";

/**
 * Pay-first checkout, step two: the laboratory details, given on the order
 * page after payment. Verifies the signed order token, validates exactly as
 * the old pre-payment form did, writes the details to the Stripe Customer and
 * then fulfils the order (request form, confirmation email, ops copy).
 */
import { detailsCopy } from "@/config/checkout-fields";
import { normaliseCustomer, validateCustomer, type CustomerDetails } from "@/lib/checkout/customer";
import { customerParams } from "@/lib/orders/metadata";
import { fulfilOrder } from "@/lib/orders/fulfil";
import { orderTokenSecret, verifyOrderToken } from "@/lib/orders/token";
import { getStripe } from "@/lib/stripe/server";

export type CompleteDetailsResult =
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "denied" }
  | { status: "not_configured"; reason: string }
  | { status: "ok" };

export async function completeDetails(input: { orderId: string; token: string; customer: CustomerDetails }): Promise<CompleteDetailsResult> {
  if (!verifyOrderToken(input.orderId, input.token, orderTokenSecret())) return { status: "denied" };
  const errors = validateCustomer(input.customer, { requiresAddress: true }, detailsCopy.errors);
  if (Object.keys(errors).length) return { status: "invalid", errors };
  const stripe = getStripe();
  if (!stripe) return { status: "not_configured", reason: "Payments are not connected yet." };

  const pi = await stripe.paymentIntents.retrieve(input.orderId, { expand: ["customer"] });
  const existing = pi.customer && typeof pi.customer !== "string" && !("deleted" in pi.customer && pi.customer.deleted) ? pi.customer : null;
  if (!existing) return { status: "denied" };

  const record = normaliseCustomer(input.customer);
  const params = customerParams(record);
  const customer = await stripe.customers.update(existing.id, {
    ...params,
    // The email used to pay stays the contact email unless the customer typed a different one here.
    email: record.email || existing.email || undefined,
    metadata: { ...params.metadata, details_status: "complete", details_completed_at: new Date().toISOString() },
  });

  if (pi.status === "succeeded") await fulfilOrder(stripe, pi, customer);
  return { status: "ok" };
}
