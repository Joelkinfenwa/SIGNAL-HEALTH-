import "server-only";
import type Stripe from "stripe";
import { buildRequestFormPdf } from "./request-form";
import { formTemplate, requestInputFromIntent, type IntentInputResult } from "./intent-input";
import type { Configuration } from "@/lib/pricing";

export { orderReference, orderReferenceSlug, testsFor } from "./intent-input";

export type RequestFormResult = { ok: true; pdf: Uint8Array } | { ok: false; missing: string[] };

/**
 * From a paid PaymentIntent with its Customer expanded. Never guesses: when
 * an identity field is missing the result names it and no PDF is produced.
 */
export async function requestFormForIntent(pi: Parameters<typeof requestInputFromIntent>[0]): Promise<RequestFormResult> {
  const r: IntentInputResult = requestInputFromIntent(pi);
  if (!r.ok) return r;
  return { ok: true, pdf: await buildRequestFormPdf(r.input) };
}

/** Load the Customer when the intent only carries its id, then build. */
export async function requestFormForIntentId(stripe: Stripe, pi: Stripe.PaymentIntent): Promise<RequestFormResult> {
  const customer = typeof pi.customer === "string" ? await stripe.customers.retrieve(pi.customer).catch(() => null) : pi.customer;
  return requestFormForIntent({ ...pi, customer });
}

/** Preview-only sample with illustrative patient details. */
export async function requestFormDemo(cfg: Configuration): Promise<Uint8Array> {
  return buildRequestFormPdf({
    ...formTemplate(cfg, "#2050", new Date()),
    patient: { firstName: "Sam", lastName: "Example", dob: "29/02/1992", sex: "Male", phone: "0412 345 678", email: "sam@example.com", address: "1 Example St, Sydney, NSW, 2000" },
  });
}
