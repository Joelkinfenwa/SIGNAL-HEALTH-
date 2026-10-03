/**
 * Pure mapping from a paid Stripe PaymentIntent (with its Customer expanded)
 * to the request-form input. No Stripe calls, no "server-only", so the
 * checkout → Stripe → form contract is testable under `node --test`.
 *
 * STRICT ON PURPOSE: the laboratory matches the sample to the person using
 * name, date of birth and address. If any identity field is missing or
 * malformed the form is NOT generated; the caller alerts operations instead.
 * A form with "-" in a field must never reach a collector.
 */
import type Stripe from "stripe";
import { getAddon, addonNewMarkers } from "../../config/addons";
import { getBiomarker } from "../../config/biomarkers";
import { getCollectionMethod } from "../../config/collection";
import { pathologyConfig } from "../../config/pathology";
import { getProduct } from "../../config/products";
import { decodeOrderMetadata } from "../orders/metadata";
import type { Configuration } from "../pricing";
import type { RequestFormInput } from "./request-form";

export const SEX_LABEL: Record<string, string> = { female: "Female", male: "Male", other: "Other" };

export type IntentInputResult = { ok: true; input: RequestFormInput } | { ok: false; missing: string[] };

/** ISO (YYYY-MM-DD) → DD/MM/YYYY, or null when not a real calendar date. */
export function dobForForm(iso: string | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

/** 0412345678 → 0412 345 678; anything else passes through trimmed. */
export const phoneForForm = (raw: string | null | undefined) => {
  const digits = (raw ?? "").replace(/\D/g, "");
  return /^04\d{8}$/.test(digits) ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : (raw ?? "").trim();
};

const tidy = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

export const orderReference = (piId: string) => `SIG-${piId.replace(/^pi_/, "").slice(-8).toUpperCase()}`;

/** Tests grouped for the form: the base panel, then each add-on's additional markers. */
export function testsFor(cfg: Configuration): RequestFormInput["tests"] {
  const product = getProduct(cfg.productId);
  if (!product) return [];
  const groups: RequestFormInput["tests"] = [{ group: `${product.name} (${product.markerIds.length} markers)`, items: product.markerIds.map((id) => getBiomarker(id).name) }];
  for (const id of cfg.addonIds) {
    const a = getAddon(id);
    if (a) groups.push({ group: `${a.name} (${addonNewMarkers(a, product).length} markers)`, items: addonNewMarkers(a, product).map((m) => getBiomarker(m).name) });
  }
  return groups;
}

/** Everything on the form that is not about this patient. */
export function formTemplate(cfg: Configuration, reference: string, issuedAt: Date): Omit<RequestFormInput, "patient"> {
  const c = pathologyConfig;
  const method = cfg.collectionMethodId ? getCollectionMethod(cfg.collectionMethodId).name : "Collection centre";
  return {
    reference, issuedAt,
    tests: testsFor(cfg),
    fasting: c.collection.fastingRequired,
    notes: `${c.notes} Collection: ${method}.`,
    formTitle: c.formTitle, referrer: c.referrer, labs: c.labs, billing: c.billing, compliance: c.compliance,
    collectorCertification: c.collectorCertification,
    collection: { fastingInstruction: c.collection.fastingInstruction, bring: c.collection.bring, instructions: c.collection.instructions },
  };
}

type CustomerLike = Pick<Stripe.Customer, "name" | "email" | "phone" | "address" | "metadata"> | Stripe.DeletedCustomer | string | null | undefined;

/**
 * Build the form input from a PaymentIntent whose `customer` is expanded.
 * Returns the list of missing fields instead of guessing.
 */
export function requestInputFromIntent(pi: Pick<Stripe.PaymentIntent, "id" | "created" | "metadata"> & { customer?: CustomerLike }): IntentInputResult {
  const missing: string[] = [];
  const decoded = decodeOrderMetadata(pi.metadata ?? {});
  const cust = pi.customer && typeof pi.customer !== "string" && !("deleted" in pi.customer && pi.customer.deleted) ? (pi.customer as Stripe.Customer) : null;
  if (!decoded) missing.push("order.metadata");
  if (!cust) missing.push("customer");
  if (!decoded || !cust) return { ok: false, missing };

  const m = cust.metadata ?? {};
  const firstName = tidy(m.first_name), lastName = tidy(m.last_name);
  const dob = dobForForm(m.dob);
  const sex = SEX_LABEL[m.sex ?? ""];
  const a = cust.address;
  const addressParts = a ? [tidy(a.line1), tidy(a.line2), tidy(a.city), tidy(a.state), tidy(a.postal_code)] : [];
  const address = addressParts.filter(Boolean).join(", ");
  const phone = phoneForForm(cust.phone);
  const email = tidy(cust.email);
  const tests = testsFor(decoded.configuration);

  if (!firstName) missing.push("first_name");
  if (!lastName) missing.push("last_name");
  if (!dob) missing.push("dob");
  if (!sex) missing.push("sex");
  if (!a || !tidy(a.line1) || !tidy(a.city) || !tidy(a.state) || !/^\d{4}$/.test(tidy(a.postal_code))) missing.push("address");
  if (!phone) missing.push("phone");
  if (!email) missing.push("email");
  if (!tests.length || !tests[0]?.items.length) missing.push("tests");
  if (!decoded.configuration.collectionMethodId) missing.push("collection");
  if (missing.length) return { ok: false, missing };

  return {
    ok: true,
    input: {
      ...formTemplate(decoded.configuration, orderReference(pi.id), new Date(pi.created * 1000)),
      patient: { firstName, lastName, dob: dob!, sex: sex!, phone, email, address },
    },
  };
}
