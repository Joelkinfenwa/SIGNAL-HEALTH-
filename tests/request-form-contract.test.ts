import assert from "node:assert/strict";
import { test } from "node:test";
import { inflateSync } from "node:zlib";
import type Stripe from "stripe";
import { emptyCustomer, normaliseCustomer, validateCustomer, type CustomerDetails } from "../src/lib/checkout/customer";
import { customerParams, encodeOrderMetadata } from "../src/lib/orders/metadata";
import { quoteConfiguration } from "../src/lib/pricing";
import { requestInputFromIntent, dobForForm, phoneForForm } from "../src/lib/pathology/intent-input";
import { buildRequestFormPdf } from "../src/lib/pathology/request-form";
import { detailsCopy } from "../src/config/checkout-fields";
import { signalTest } from "../src/config/products";
import { getAddon, addonNewMarkers } from "../src/config/addons";
import { getBiomarker } from "../src/config/biomarkers";

/**
 * Checkout → Stripe → request form contract. Exercises the exact functions
 * checkout uses to write the Stripe Customer and PaymentIntent, then the exact
 * function the webhook and download route use to read them back. No Stripe
 * calls: the objects are what Stripe would return.
 */
const typed = (over: Partial<CustomerDetails> = {}): CustomerDetails => ({
  ...emptyCustomer(),
  firstName: "  Sam ", lastName: "o'Brien-Smith ", dobDay: "29", dobMonth: "2", dobYear: "1992", sex: "male", gender: "man",
  email: "Sam@Example.COM ", phone: "+61 412 345 678", postcode: "2000", addressLine1: "Unit 5, 1 Example St", addressLine2: "", suburb: "Sydney", state: "NSW",
  acceptsTerms: true, marketingOptIn: false, ...over,
});

/** What checkout stores, as Stripe would hand it back. */
function stripeObjects(details: CustomerDetails, addonIds: string[], collection: "centre" | "mobile") {
  const errors = validateCustomer(details, { requiresAddress: true }, detailsCopy.errors);
  assert.deepEqual(errors, {}, "checkout validation must pass before an order exists");
  const record = normaliseCustomer(details);
  const params = customerParams(record);
  const cfg = { productId: "signal", addonIds, collectionMethodId: collection } as const;
  const quote = quoteConfiguration(cfg);
  const customer = { id: "cus_test", object: "customer", ...params, metadata: { ...params.metadata, order_ip: "1.2.3.4", order_ua: "ua" } } as unknown as Stripe.Customer;
  const pi = { id: "pi_3TestABCDEFGH1234", created: 1_790_000_000, metadata: encodeOrderMetadata(cfg, quote.lines, {}, "evt"), customer };
  return { pi, record };
}

/** Decompress every Flate stream and return the literal strings drawn with Tj. */
function pdfText(bytes: Uint8Array): string {
  const buf = Buffer.from(bytes);
  const out: string[] = [];
  let idx = 0;
  while ((idx = buf.indexOf("stream\n", idx)) !== -1) {
    const start = idx + 7; const end = buf.indexOf("endstream", start);
    try { out.push(inflateSync(buf.subarray(start, end)).toString("latin1")); } catch { /* not a flate stream */ }
    idx = end;
  }
  // pdf-lib writes standard-font text as hex strings: <48656C6C6F> Tj
  return out.join("\n").replace(/<([0-9A-Fa-f]+)>\s*Tj/g, (_, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
}

test("details typed at checkout arrive on the form exactly, normalised", async () => {
  const { pi } = stripeObjects(typed(), ["hormones_plus", "heart_plus"], "mobile");
  const r = requestInputFromIntent(pi);
  assert.ok(r.ok, JSON.stringify(r));
  const p = r.input.patient;
  assert.equal(p.firstName, "Sam");
  assert.equal(p.lastName, "o'Brien-Smith");
  assert.equal(p.dob, "29/02/1992");
  assert.equal(p.sex, "Male");
  assert.equal(p.phone, "0412 345 678");
  assert.equal(p.email, "sam@example.com");
  assert.equal(p.address, "Unit 5, 1 Example St, Sydney, NSW, 2000");
  assert.equal(r.input.reference, "SIG-EFGH1234");
  assert.equal(r.input.fasting, true);
  assert.match(r.input.notes, /At home or work/);
  // Every base marker and every add-on marker is on the form, and nothing else.
  const names = r.input.tests.flatMap((g) => g.items);
  const expected = [...signalTest.markerIds, ...["hormones_plus", "heart_plus"].flatMap((id) => addonNewMarkers(getAddon(id)!))].map((m) => getBiomarker(m).name);
  assert.deepEqual(names, expected);
  assert.deepEqual(r.input.tests.map((g) => g.group), ["The SIGNAL Test (32 markers)", "Hormones+ (7 markers)", "Heart+ (4 markers)"]);

  // And the PDF literally contains them.
  const text = pdfText(await buildRequestFormPdf(r.input));
  for (const s of ["SIG-EFGH1234", "O'BRIEN-SMITH", "Sam", "29/02/1992", "Male", "0412 345 678", "Unit 5, 1 Example St, Sydney, NSW, 2000", "Total testosterone", "Lp(a)", "4Cyte Pathology", "BR479", "N1687", "9EXP", "DO NOT BILL THE PATIENT"]) {
    assert.ok(text.includes(s), `PDF should contain "${s}"`);
  }
  for (const banned of ["Laverty", "QML", "PathWest", "Dorevitch", "Provider number", "DRAFT"]) assert.ok(!text.includes(banned), banned);
});

test("centre collection, base test only, 2-digit day and month", async () => {
  const { pi } = stripeObjects(typed({ dobDay: "01", dobMonth: "12", dobYear: "1970", phone: "0400000000", sex: "female", firstName: "Alex", lastName: "Nguyen" }), [], "centre");
  const r = requestInputFromIntent(pi);
  assert.ok(r.ok, JSON.stringify(r));
  assert.equal(r.input.patient.dob, "01/12/1970");
  assert.equal(r.input.patient.sex, "Female");
  assert.equal(r.input.patient.phone, "0400 000 000");
  assert.equal(r.input.tests.length, 1);
  assert.equal(r.input.tests[0]!.items.length, 32);
  const text = pdfText(await buildRequestFormPdf(r.input));
  assert.ok(text.includes("NGUYEN") && text.includes("01/12/1970") && text.includes("Collection centre"));
});

test("a form is never issued with missing identity fields", () => {
  const { pi } = stripeObjects(typed(), [], "centre");
  const strip = (patch: Record<string, unknown>) => requestInputFromIntent({ ...pi, customer: { ...pi.customer, ...patch } });
  const noDob = strip({ metadata: { ...pi.customer.metadata, dob: "" } });
  assert.deepEqual(noDob, { ok: false, missing: ["dob"] });
  const badDob = strip({ metadata: { ...pi.customer.metadata, dob: "1992-02-30" } });
  assert.deepEqual(badDob, { ok: false, missing: ["dob"] });
  const noSex = strip({ metadata: { ...pi.customer.metadata, sex: "" } });
  assert.deepEqual(noSex, { ok: false, missing: ["sex"] });
  const noAddr = strip({ address: { postal_code: "2000", country: "AU" } });
  assert.deepEqual(noAddr, { ok: false, missing: ["address"] });
  const noName = strip({ metadata: { ...pi.customer.metadata, first_name: "  ", last_name: "" } });
  assert.deepEqual(noName, { ok: false, missing: ["first_name", "last_name"] });
  assert.deepEqual(requestInputFromIntent({ ...pi, customer: "cus_unexpanded" }), { ok: false, missing: ["customer"] });
  assert.deepEqual(requestInputFromIntent({ ...pi, customer: { id: "cus_x", object: "customer", deleted: true } as never }), { ok: false, missing: ["customer"] });
  assert.equal(requestInputFromIntent({ ...pi, metadata: {} }).ok, false);
});

test("checkout refuses an order without a full address for any collection method", () => {
  const centreNoAddress = typed({ addressLine1: "", suburb: "", state: "" });
  const errors = validateCustomer(centreNoAddress, { requiresAddress: true }, detailsCopy.errors);
  assert.deepEqual(Object.keys(errors).sort(), ["addressLine1", "state", "suburb"]);
});

test("date and phone formatting helpers", () => {
  assert.equal(dobForForm("2000-01-05"), "05/01/2000");
  assert.equal(dobForForm("2001-02-29"), null);
  assert.equal(dobForForm("5/1/2000"), null);
  assert.equal(dobForForm(undefined), null);
  assert.equal(phoneForForm("0412345678"), "0412 345 678");
  assert.equal(phoneForForm("+61 2 9545 2940"), "+61 2 9545 2940");
  assert.equal(phoneForForm(null), "");
});
