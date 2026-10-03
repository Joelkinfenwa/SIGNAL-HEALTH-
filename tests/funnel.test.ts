import assert from "node:assert/strict";
import { test } from "node:test";
import { addonsFromCents, menFunnel, trackOffer, unverifiedClaimCount } from "../src/config/funnel/men";
import { addons } from "../src/config/addons";
import { signalTest } from "../src/config/products";

test("funnel page follows the nine-block structure with the required content", () => {
  assert.equal(menFunnel.trustStrip.length, 3);
  assert.equal(menFunnel.hero.miniTrust.length, 3);
  assert.equal(menFunnel.included.bullets.length, 4);
  assert.ok(menFunnel.steps.items.length <= 4 && menFunnel.steps.items.length >= 3);
  assert.equal(menFunnel.fit.bestFor.length, 3);
  assert.equal(menFunnel.fit.notFor.length, 3);
  assert.deepEqual(menFunnel.plans.cards.map((c) => c.id), ["one_time", "retest_6m", "retest_3m"]);
  assert.equal(menFunnel.faq.items.length, 8);
  for (const i of menFunnel.faq.items) assert.ok(i.a.split(/[.!?]\s/).length <= 4, `FAQ answer stays short: ${i.q}`);
});

test("plan cards point at real retesting offers and prices are never typed into copy", () => {
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
  assert.ok(!("quotes" in menFunnel.proof) && !("testimonials" in menFunnel.proof), "proof section carries facts, never quotes");
  assert.ok(menFunnel.proof.facts.length >= 4);
  assert.ok(menFunnel.plans.optionalNote.toLowerCase().includes("optional"));
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
