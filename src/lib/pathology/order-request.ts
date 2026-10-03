import "server-only";
import type Stripe from "stripe";
import { getAddon, addonNewMarkers } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { getCollectionMethod } from "@/config/collection";
import { pathologyConfig } from "@/config/pathology";
import { getProduct, signalTest } from "@/config/products";
import { decodeOrderMetadata } from "@/lib/orders/metadata";
import type { Configuration } from "@/lib/pricing";
import { buildRequestFormPdf, type RequestFormInput } from "./request-form";

const SEX: Record<string, string> = { female: "Female", male: "Male", other: "Intersex / other" };
const fmtDob = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "-");

/** Tests grouped for the form: the base panel, then each add-on's additional markers. */
export function testsFor(cfg: Configuration): RequestFormInput["tests"] {
  const product = getProduct(cfg.productId) ?? signalTest;
  const groups: RequestFormInput["tests"] = [{ group: `${product.name} (${product.markerIds.length} markers)`, items: product.markerIds.map((id) => getBiomarker(id).name) }];
  for (const id of cfg.addonIds) {
    const a = getAddon(id);
    if (a) groups.push({ group: `${a.name} (${addonNewMarkers(a, product).length} markers)`, items: addonNewMarkers(a, product).map((m) => getBiomarker(m).name) });
  }
  return groups;
}

function base(reference: string, issuedAt: Date, cfg: Configuration): Omit<RequestFormInput, "patient"> {
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

export const orderReference = (piId: string) => `SIG-${piId.replace(/^pi_/, "").slice(-8).toUpperCase()}`;

/** From a paid PaymentIntent with its Customer expanded. */
export async function requestFormForIntent(pi: Stripe.PaymentIntent): Promise<Uint8Array | null> {
  const decoded = decodeOrderMetadata(pi.metadata);
  const cust = pi.customer && typeof pi.customer !== "string" && !("deleted" in pi.customer && pi.customer.deleted) ? pi.customer : null;
  if (!decoded || !cust) return null;
  const m = cust.metadata ?? {};
  const addr = cust.address ? [cust.address.line1, cust.address.line2, cust.address.city, cust.address.state, cust.address.postal_code].filter(Boolean).join(", ") : undefined;
  const input: RequestFormInput = {
    ...base(orderReference(pi.id), new Date(pi.created * 1000), decoded.configuration),
    patient: { firstName: m.first_name || cust.name?.split(" ")[0] || "", lastName: m.last_name || cust.name?.split(" ").slice(1).join(" ") || "", dob: fmtDob(m.dob), sex: SEX[m.sex ?? ""] ?? m.sex ?? "-", phone: cust.phone ?? undefined, email: cust.email ?? undefined, address: addr },
  };
  return buildRequestFormPdf(input);
}

/** Preview-only sample with illustrative patient details. */
export async function requestFormDemo(cfg: Configuration): Promise<Uint8Array> {
  return buildRequestFormPdf({
    ...base("SIG-DEMO0001", new Date(), cfg),
    patient: { firstName: "Sam", lastName: "Example", dob: "29/02/1992", sex: "Male", phone: "0412 345 678", email: "sam@example.com", address: "1 Example St, Sydney NSW 2000" },
  });
}
