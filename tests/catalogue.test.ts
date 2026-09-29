import assert from "node:assert/strict";
import { test } from "node:test";
import { addons } from "../src/config/addons";
import { biomarkerCategories, biomarkers, getBiomarker } from "../src/config/biomarkers";
import { signalTest } from "../src/config/products";
import { recommend } from "../src/config/quiz";

test("every product and add-on marker id exists in the catalogue", () => {
  for (const id of signalTest.markerIds) getBiomarker(id);
  for (const a of addons) for (const id of a.markerIds) getBiomarker(id);
});

test("every marker's category exists and derived markers reference real inputs", () => {
  const cats = new Set(biomarkerCategories.map((c) => c.id));
  for (const m of biomarkers) {
    assert.ok(cats.has(m.category), `${m.id} category`);
    for (const d of m.derivedFrom ?? []) getBiomarker(d);
  }
});

test("marker copy never names conditions", () => {
  const banned = /diabet|cancer|disease|diagnos|treat|prevent|cure|deficien|syndrome|disorder/i;
  for (const m of biomarkers) assert.ok(!banned.test(m.about), `${m.id}: ${m.about}`);
});

test("quiz recommends the SIGNAL test plus matching add-ons, capped at three", () => {
  const r = recommend({ interests: ["heart", "thyroid", "training", "metabolic", "hormones"], training: "serious" });
  assert.equal(r.product.id, "signal");
  assert.ok(r.addons.length <= 3);
  const r2 = recommend({ interests: ["general"] });
  assert.deepEqual(r2.addons, []);
  const r3 = recommend({ interests: [], training: "serious" });
  assert.deepEqual(r3.addons.map((a) => a.id), ["performance_plus"]);
});
