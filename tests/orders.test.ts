import assert from "node:assert/strict";
import { test } from "node:test";
import { resolvePrice } from "../src/config/pricing";
import { decodeOrderMetadata, encodeOrderMetadata } from "../src/lib/orders/metadata";
import { signOrderToken, verifyOrderToken } from "../src/lib/orders/token";
import type { QuoteLine } from "../src/lib/pricing";

test("order tokens verify only with the right id and secret", () => {
  const t = signOrderToken("pi_123", "secret-a");
  assert.ok(verifyOrderToken("pi_123", t, "secret-a"));
  assert.ok(!verifyOrderToken("pi_124", t, "secret-a"));
  assert.ok(!verifyOrderToken("pi_123", t, "secret-b"));
  assert.ok(!verifyOrderToken("pi_123", undefined, "secret-a"));
  assert.ok(!verifyOrderToken("pi_123", t.slice(0, -1), "secret-a"));
});

test("order metadata round-trips configuration and snapshotted prices within Stripe limits", () => {
  const lines: QuoteLine[] = [
    { kind: "product", id: "signal", label: "The SIGNAL Test", priceCents: 34900 },
    { kind: "addon", id: "hormones_plus", label: "Hormones+", priceCents: 5900 },
    { kind: "addon", id: "nutrients_plus", label: "Nutrients+", priceCents: 4900 },
    { kind: "collection", id: "mobile", label: "At home or work", priceCents: 4900 },
  ];
  const m = encodeOrderMetadata(
    { productId: "signal", addonIds: ["hormones_plus", "nutrients_plus"], collectionMethodId: "mobile" },
    lines,
    { lp_slug: "runners", experiment_id: "configurator_heading", variant: "deeper", first: { utm_source: "meta", utm_campaign: "launch", landing_path: "/lp/runners" }, last: { gclid: "abc" } },
    "evt-1",
  );
  assert.ok(Object.keys(m).length <= 50);
  for (const [k, v] of Object.entries(m)) { assert.ok(k.length <= 40, k); assert.ok(v.length <= 500, k); }
  assert.equal(m.first_utm_source, "meta");
  assert.equal(m.last_gclid, "abc");
  assert.equal(m.experiment, "configurator_heading:deeper");
  const d = decodeOrderMetadata(m)!;
  assert.deepEqual(d.configuration, { productId: "signal", addonIds: ["hormones_plus", "nutrients_plus"], collectionMethodId: "mobile" });
  assert.deepEqual(d.lines.map((l) => l.priceCents), [34900, 5900, 4900, 4900]);
  assert.equal(d.eventId, "evt-1");
  assert.equal(decodeOrderMetadata({}), null);
});

test("preview pricing never overrides a real price and is off by default", () => {
  assert.equal(resolvePrice("signal", 29900), 29900);
  assert.equal(resolvePrice("heart_plus", null), process.env.NEXT_PUBLIC_PREVIEW_PRICING === "1" ? 9900 : null);
  assert.equal(resolvePrice("unknown", null), null);
});

test("DOB and sex never ride on the PaymentIntent metadata", () => {
  const m = encodeOrderMetadata({ productId: "signal", addonIds: [] }, [], {}, "e");
  for (const k of Object.keys(m)) assert.ok(!/dob|sex|gender|name|email|phone/.test(k), k);
});
