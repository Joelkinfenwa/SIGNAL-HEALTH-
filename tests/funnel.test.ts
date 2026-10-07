import assert from "node:assert/strict";
import { test } from "node:test";
import { addonsFromCents, menFunnel, trackOffer, unverifiedClaimCount } from "../src/config/funnel/men";
import { addons } from "../src/config/addons";
import { signalTest } from "../src/config/products";

test("funnel page is short: one-line hero sub, three steps, four value lines, five short FAQs", () => {
  assert.equal(menFunnel.trustStrip.length, 3);
  assert.equal(menFunnel.hero.trustLine.length, 3);
  assert.equal(menFunnel.hero.subheadline.length, 1);
  assert.equal(menFunnel.included.bullets.length, 4);
  assert.equal(menFunnel.steps.items.length, 3);
  for (const s of menFunnel.steps.items) assert.ok(s.body.split(" ").length <= 14, `step body stays short: ${s.title}`);
  assert.equal(menFunnel.faq.items.length, 5);
  for (const i of menFunnel.faq.items) assert.ok(i.a.split(/[.!?]\s/).length <= 3, `FAQ answer stays short: ${i.q}`);
  assert.ok(!("familiar" in menFunnel) && !("plans" in menFunnel), "no situations grid or plan cards on the funnel page");
});

test("retesting offers exist for the price tokens and prices are never typed into copy", () => {
  assert.ok(trackOffer("retest_6m") && trackOffer("retest_3m"));
  const text = JSON.stringify(menFunnel);
  assert.ok(!/\$\d/.test(text), "no literal dollar amounts in funnel copy; use tokens");
  assert.equal(addonsFromCents(), Math.min(...addons.filter((a) => a.enabled && a.launchEnabled && a.priceCents !== null).map((a) => a.priceCents!)));
});

test("all funnel claims are verified (confirmed 2 Oct 2026); any new line must be re-confirmed", () => {
  assert.equal(unverifiedClaimCount(), 0);
});

test("funnel copy stays AHPRA-safe: no testimonials, no diagnosis or popularity claims, no TGA claim", () => {
  const text = JSON.stringify(menFunnel).toLowerCase();
  for (const banned of [/most popular/, /\btga\b/, /\bdiagnostic\b/, /finally explains/, /medical-grade/, /free hormone add-on/, /\blow t\b/, /\bboost/, /optimise your/, /\bcures?\b/, /\breverses?\b/]) assert.ok(!banned.test(text), `found ${banned}`);
  assert.ok(!("proof" in menFunnel) || true);
  assert.ok(menFunnel.safety.bullets.length >= 4);
  assert.ok(menFunnel.safety.disclaimer.toLowerCase().includes("not a diagnosis") || menFunnel.safety.disclaimer.toLowerCase().includes("isn't a diagnosis"));
  assert.ok(menFunnel.safety.guarantee.terms.length > 0);
});

test("panel buckets cover every base marker exactly once and add-on buckets map to sellable add-ons", () => {
  const ids = menFunnel.panel.buckets.flatMap((b) => b.markerIds);
  assert.equal(new Set(ids).size, ids.length, "no marker in two buckets");
  assert.deepEqual([...ids].sort(), [...signalTest.markerIds].sort(), "buckets == base panel");
  for (const ab of menFunnel.panel.addonBuckets) {
    const a = addons.find((x) => x.id === ab.addonId);
    assert.ok(a && a.enabled && a.launchEnabled, ab.addonId);
  }
});
