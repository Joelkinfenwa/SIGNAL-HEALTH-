import assert from "node:assert/strict";
import { test } from "node:test";
import { womenAddonsFromCents, womenFunnel, womenTrackOffer, womenUnverifiedClaimCount } from "../src/config/funnel/women";
import { addons, getAddon } from "../src/config/addons";
import { signalTest, signalWomen } from "../src/config/products";
import { parseConfiguration, quoteConfiguration, serializeConfiguration } from "../src/lib/pricing";

test("women's offer: same markers as the flagship, lower price, compare-at set, sold via ?product=signal_women", () => {
  assert.deepEqual([...signalWomen.markerIds].sort(), [...signalTest.markerIds].sort());
  assert.ok(signalWomen.priceCents! < signalTest.priceCents!);
  assert.equal(signalWomen.compareAtPriceCents, signalTest.priceCents);
  const cfg = parseConfiguration(new URLSearchParams("product=signal_women&addons=nutrients_plus"));
  assert.equal(cfg.productId, "signal_women");
  const q = quoteConfiguration(cfg);
  assert.equal(q.totalCents, signalWomen.priceCents! + getAddon("nutrients_plus")!.priceCents!);
  assert.equal(serializeConfiguration(cfg), "?product=signal_women&addons=nutrients_plus");
  assert.equal(parseConfiguration(new URLSearchParams("product=nope")).productId, "signal", "unknown product falls back to the flagship");
  assert.equal(serializeConfiguration(parseConfiguration(new URLSearchParams(""))), "", "flagship never carries a product param");
});

test("women's funnel is short and every link carries the women's product", () => {
  const f = womenFunnel;
  assert.equal(f.hero.subheadline.length, 1);
  assert.equal(f.offer.rows.length, 5);
  assert.equal(f.upsell.addonIds.length, 3);
  for (const id of f.upsell.addonIds) assert.ok(signalWomen.addonIds.includes(id) && getAddon(id)?.launchEnabled, id);
  assert.equal(f.steps.items.length, 3);
  assert.equal(f.familiar.items.length, 3);
  assert.deepEqual(f.plans.rows.map((r) => r.id), ["one_time", "retest_6m", "retest_3m"]);
  assert.equal(f.faq.items.length, 5);
  for (const i of f.faq.items) assert.ok(i.a.split(/[.!?]\s/).length <= 3, `FAQ answer stays short: ${i.q}`);
  const hrefs = [f.hero.primaryCta.href, f.close.cta.href, ...f.plans.rows.map((r) => r.href)];
  for (const h of hrefs) assert.ok(h.includes("product=signal_women"), h);
  assert.ok(womenTrackOffer("retest_6m") && womenTrackOffer("retest_3m"));
  assert.equal(womenAddonsFromCents(), Math.min(...addons.filter((a) => a.enabled && a.launchEnabled && a.priceCents !== null && signalWomen.addonIds.includes(a.id)).map((a) => a.priceCents!)));
});

test("women's funnel claims are verified and the copy stays AHPRA-safe", () => {
  assert.equal(womenUnverifiedClaimCount(), 0);
  const text = JSON.stringify(womenFunnel).toLowerCase();
  assert.ok(!/\$\d/.test(text), "no literal dollar amounts; use tokens");
  for (const banned of [/most popular/, /\btga\b/, /\bdiagnostic\b/, /finally explains/, /medical-grade/, /\bboost/, /optimise your/, /\bcures?\b/, /\breverses?\b/, /limited time/, /hurry/, /today only/]) assert.ok(!banned.test(text), `found ${banned}`);
  assert.ok(womenFunnel.plans.optionalNote.toLowerCase().includes("optional"));
  assert.ok(womenFunnel.safety.guarantee.terms.length > 0);
  assert.ok(womenFunnel.safety.disclaimer.toLowerCase().includes("isn't a diagnosis"));
});
