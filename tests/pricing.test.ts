import assert from "node:assert/strict";
import { test } from "node:test";
import { addons } from "../src/config/addons";
import { signalTest } from "../src/config/products";
import { displayTotal, parseConfiguration, parseRecommended, quoteConfiguration, serializeConfiguration, toggleAddon } from "../src/lib/pricing";

test("base configuration counts every base marker once", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: [] });
  assert.equal(q.markerCount, signalTest.markerIds.length);
  assert.equal(new Set(signalTest.markerIds).size, signalTest.markerIds.length, "no duplicate marker ids in the base panel");
  assert.equal(q.lines.length, 1);
});

test("add-ons add only markers not already in the base panel", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus", "nutrients_plus"] });
  const base = new Set(signalTest.markerIds);
  const added = q.markerIds.filter((m) => !base.has(m));
  assert.ok(added.includes("apob") && added.includes("vit_d"));
  assert.equal(q.markerCount, base.size + added.length);
});

test("unknown, disabled or unlaunched add-ons are ignored", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["psa", "nope", "heart_plus"] });
  assert.deepEqual(q.addons.map((a) => a.id), ["heart_plus"]);
  const perf = addons.find((a) => a.id === "performance_plus")!;
  const saved = perf.launchEnabled;
  perf.launchEnabled = false;
  try {
    const q2 = quoteConfiguration({ productId: "signal", addonIds: ["performance_plus", "heart_plus"] });
    assert.deepEqual(q2.addons.map((a) => a.id), ["heart_plus"], "unlaunched add-on never enters a quote");
    assert.deepEqual(parseConfiguration(new URLSearchParams("?addons=performance_plus,heart_plus")).addonIds, ["heart_plus"]);
  } finally {
    perf.launchEnabled = saved;
  }
});

test("recommended add-ons travel separately from preselected ones", () => {
  const s = serializeConfiguration({ productId: "signal", addonIds: ["hormones_plus"] }, { recommendedAddonIds: ["hormones_plus", "nutrients_plus"] });
  assert.equal(s, "?addons=hormones_plus&rec=nutrients_plus");
  const params = new URLSearchParams(s);
  assert.deepEqual(parseConfiguration(params).addonIds, ["hormones_plus"]);
  assert.deepEqual(parseRecommended(params), ["nutrients_plus"]);
});

test("quote is incomplete while any price is null, complete otherwise", () => {
  const q = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus"], collectionMethodId: "mobile" });
  assert.equal(q.pricingComplete, process.env.NEXT_PUBLIC_PREVIEW_PRICING === "1");
  if (!q.pricingComplete) assert.equal(q.totalCents, null);
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

test("display total shows the priced part plus TBC while a line is unpriced", () => {
  const fmt = (c: number) => `$${c / 100}`;
  const q = quoteConfiguration({ productId: "signal", addonIds: ["heart_plus"] });
  assert.equal(q.totalCents, 29900 + 21900);
  const unpriced = { ...q, lines: [...q.lines, { kind: "collection" as const, id: "mobile", label: "At home", priceCents: null }], totalCents: null, pricingComplete: false, unpricedCount: 1 };
  assert.equal(displayTotal(unpriced, fmt, "soon"), "$518 + TBC");
  assert.equal(displayTotal(quoteConfiguration({ productId: "signal", addonIds: [] }), fmt, "soon"), "$299");
});
