/**
 * Stripe is the order store until a database exists: the PaymentIntent
 * carries the commerce facts (configuration, snapshotted line prices,
 * attribution), the Customer carries the person. These pure helpers encode
 * and decode that metadata so the shape lives in one place.
 *
 * Stripe limits: 50 keys, 40-char keys, 500-char values.
 */
import type { CollectionMethodId } from "../../config/collection";
import type { NormalisedCustomer } from "../checkout/customer";
import type { Configuration, QuoteLine } from "../pricing";

export interface AttributionTouch { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string; gclid?: string; gbraid?: string; wbraid?: string; fbclid?: string; landing_path?: string }
export interface OrderContext { lp_slug?: string; experiment_id?: string; variant?: string; first?: AttributionTouch; last?: AttributionTouch }

const clip = (v: string | undefined, n = 480) => (v ?? "").slice(0, n);

export function encodeOrderMetadata(cfg: Configuration, lines: QuoteLine[], ctx: OrderContext, eventId: string): Record<string, string> {
  const m: Record<string, string> = {
    product_id: cfg.productId,
    addon_ids: cfg.addonIds.join(","),
    collection: cfg.collectionMethodId ?? "",
    lines: JSON.stringify(lines.map((l) => ({ k: l.kind, i: l.id, p: l.priceCents ?? 0 }))),
    event_id: eventId,
    source: "initial",
    lp_slug: clip(ctx.lp_slug, 80),
    experiment: ctx.experiment_id ? `${ctx.experiment_id}:${ctx.variant ?? ""}` : "",
  };
  const touch = (prefix: string, t?: AttributionTouch) => {
    if (!t) return;
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "landing_path"] as const) {
      if (t[k]) m[`${prefix}_${k}`] = clip(t[k], 200);
    }
  };
  touch("first", ctx.first);
  touch("last", ctx.last);
  for (const k of Object.keys(m)) if (!m[k]) delete m[k];
  return m;
}

export interface DecodedOrder { configuration: Configuration; lines: { kind: QuoteLine["kind"]; id: string; priceCents: number }[]; eventId: string }

export function decodeOrderMetadata(m: Record<string, string | undefined>): DecodedOrder | null {
  if (!m.product_id) return null;
  let lines: DecodedOrder["lines"] = [];
  try {
    lines = (JSON.parse(m.lines ?? "[]") as { k: QuoteLine["kind"]; i: string; p: number }[]).map((l) => ({ kind: l.k, id: l.i, priceCents: l.p }));
  } catch { lines = []; }
  const collection = m.collection === "centre" || m.collection === "mobile" ? (m.collection as CollectionMethodId) : undefined;
  return {
    configuration: { productId: m.product_id, addonIds: (m.addon_ids ?? "").split(",").filter(Boolean), collectionMethodId: collection },
    lines,
    eventId: m.event_id ?? "",
  };
}

/** What goes on the Stripe Customer: contact + the identity facts the laboratory needs. */
export function customerParams(c: NormalisedCustomer) {
  return {
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    phone: c.phone,
    address: c.address
      ? { line1: c.address.line1, line2: c.address.line2, city: c.address.suburb, state: c.address.state, postal_code: c.address.postcode, country: "AU" }
      : { postal_code: c.postcode, country: "AU" },
    metadata: {
      first_name: c.firstName,
      last_name: c.lastName,
      dob: c.dob ?? "",
      sex: c.sex,
      gender: c.gender ?? "",
      consent_terms: c.consents.terms ? "1" : "0",
      consent_marketing_email: c.consents.marketingEmail ? "1" : "0",
    },
  };
}
