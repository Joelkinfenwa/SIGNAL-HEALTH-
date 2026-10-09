import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { addons, addonsFor } from "../src/config/addons";
import { biomarkerCategories, biomarkers, getBiomarker, groupByCategory } from "../src/config/biomarkers";
import { signalTest } from "../src/config/products";
import { landingPages } from "../src/config/landing-pages";
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
  assert.deepEqual(r3.addons.map((a) => a.id).sort(), ["hormones_plus", "nutrients_plus", "performance_plus"]);
  const r4 = recommend({ interests: ["metabolic"] });
  assert.deepEqual(r4.addons, [], "metabolic is covered by the base test; no add-on");
});

test("base SIGNAL Test: ten areas, no hormones or vitamins (product architecture decision)", () => {
  const base = new Set(signalTest.markerIds);
  for (const id of ["testosterone", "shbg", "free_t", "vit_d", "b12", "folate"]) assert.ok(!base.has(id), `${id} must not be in the base test`);
  assert.equal(signalTest.markerIds.length, 32);
  assert.deepEqual(groupByCategory(signalTest.markerIds).map((g) => g.category.id), ["heart", "metabolic", "thyroid", "iron", "inflammation", "liver", "kidney", "electrolytes", "minerals", "blood"]);
});

test("five add-ons, in the configured order, each adding only new markers", () => {
  assert.deepEqual(addonsFor(signalTest).map((a) => a.id), ["hormones_plus", "nutrients_plus", "heart_plus", "thyroid_plus", "performance_plus"]);
  const base = new Set(signalTest.markerIds);
  for (const a of addonsFor(signalTest)) {
    assert.ok(a.markerIds.length > 0, `${a.id} has markers`);
    for (const m of a.markerIds) assert.ok(!base.has(m), `${a.id} re-sells base marker ${m}`);
    assert.ok(a.shortDescription.length < 90, `${a.id} short description stays short`);
  }
  assert.ok(addons.find((a) => a.id === "psa")!.enabled === false);
  assert.ok(!addons.some((a) => a.id === "metabolic_plus"));
});

test("internal cost never reaches the client bundle", () => {
  const costs = readFileSync(new URL("../src/config/internal/costs.ts", import.meta.url), "utf8");
  assert.ok(costs.startsWith('import "server-only";'), "costs module is server-only");
  for (const a of addons) assert.ok(!("costInternal" in a) && !("costInternalCents" in a), `${a.id} carries no cost field`);
  const offenders = walk("src").filter((f) => /\.(tsx?|mjs|js)$/.test(f) && !f.includes("config/internal")).filter((f) => /from\s+["'][^"']*config\/internal\/costs["']/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, [], "no component or page imports the internal cost module");
});

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
}

test("landing pages only recommend or preselect sellable add-ons", () => {
  for (const p of landingPages) {
    for (const id of [...p.recommendedAddonIds, ...p.preselectedAddonIds]) {
      const a = addons.find((x) => x.id === id);
      assert.ok(a && a.enabled && a.launchEnabled && signalTest.addonIds.includes(id), `${p.slug}: ${id} must be a sellable add-on of the product`);
    }
  }
});

test("the seven panel areas cover exactly the SIGNAL Test markers, once each", async () => {
  const { panelAreas } = await import("../src/config/panel");
  const { signalTest } = await import("../src/config/products");
  const ids = panelAreas.flatMap((a) => a.markerIds);
  assert.equal(ids.length, new Set(ids).size, "no marker appears in two areas");
  assert.deepEqual([...ids].sort(), [...signalTest.markerIds].sort(), "areas and product list the same markers");
});
