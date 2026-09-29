import assert from "node:assert/strict";
import { test } from "node:test";
import { addons } from "../src/config/addons";
import { signalTest } from "../src/config/products";
import { parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon } from "../src/lib/pricing";

test("base configuration counts every base marker once", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: [] });
  assert.equal(q.markerCount, signalTest.markerIds.length);
  assert.equal(new Set(signalTest.markerIds).size, signalTest.markerIds.length, "no duplicate marker ids in the base panel");
  assert.equal(q.lines.length, 1);
});

test("add-ons add only markers not already in the base panel", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus", "metabolic_plus"] });
  const base = new Set(signalTest.markerIds);
  const added = q.markerIds.filter((m) => !base.has(m));
  assert.ok(added.includes("apob") && added.includes("insulin"));
  assert.equal(q.markerCount, base.size + added.length);
});

test("unknown or under-review add-ons are ignored", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["psa", "nope", "heart_plus"] });
  assert.deepEqual(q.addons.map((a) => a.id), ["heart_plus"]);
});

test("quote is incomplete while any price is null, complete otherwise", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus"] });
  assert.equal(q.pricingComplete, false);
  assert.equal(q.totalCents, null);
  // Simulate priced config.
  const priced = { ...signalTest, priceCents: 34900 };
  const heart = addons.find((a) => a.id === "heart_plus")!;
  const saved = [signalTest.priceCents, heart.priceCents];
  signalTest.priceCents = priced.priceCents; heart.priceCents = 4900;
  try {
    const q2 = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus"], collectionMethodId: "centre" });
    assert.equal(q2.pricingComplete, true);
    assert.equal(q2.totalCents, 34900 + 4900 + 0);
  } finally {
    signalTest.priceCents = saved[0]!; heart.priceCents = saved[1]!;
  }
});

test("configuration round-trips through the URL", () => {
  const cfg = { productId: "signal", addonIds: ["thyroid_plus", "heart_plus"], collectionMethodId: "mobile" as const };
  const s = serializeConfiguration(cfg);
  assert.equal(s, "?addons=thyroid_plus%2Cheart_plus&collection=mobile");
  const back = parseConfiguration(new URLSearchParams(s));
  assert.deepEqual(back, cfg);
  assert.equal(serializeConfiguration({ productId: "signal", addonIds: [] }), "");
});

test("toggleAddon adds then removes", () => {
  let cfg = { productId: "signal", addonIds: [] as string[] };
  cfg = toggleAddon(cfg, "heart_plus");
  assert.deepEqual(cfg.addonIds, ["heart_plus"]);
  cfg = toggleAddon(cfg, "heart_plus");
  assert.deepEqual(cfg.addonIds, []);
});
