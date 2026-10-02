import assert from "node:assert/strict";
import { test } from "node:test";
import { addonsFromCents, menFunnel, trackOffer, unverifiedClaimCount } from "../src/config/funnel/men";
import { addons } from "../src/config/addons";

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

test("unverified claims are counted so they cannot be forgotten", () => {
  assert.ok(unverifiedClaimCount() > 0, "nothing to clear yet means the flags were removed without verification");
});
