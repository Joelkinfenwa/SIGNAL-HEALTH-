import assert from "node:assert/strict";
import { test } from "node:test";
import { legalDocuments } from "../src/config/legal";
import { legalPlaceholders } from "../src/config/legal/entity";
import { postPurchaseOffer } from "../src/config/retest-offer";

test("the three linked legal documents exist with sections and anchors", () => {
  assert.deepEqual(legalDocuments.map((d) => d.slug), ["terms", "privacy", "retesting-terms"]);
  for (const d of legalDocuments) {
    assert.ok(d.sections.length >= 7, d.slug);
    assert.equal(new Set(d.sections.map((s) => s.id)).size, d.sections.length, `${d.slug} anchors unique`);
  }
});

test("retesting terms mirror the post-purchase disclosure", () => {
  const text = legalDocuments.find((d) => d.slug === "retesting-terms")!.sections.flatMap((s) => s.body).join("\n");
  assert.ok(text.includes(`${postPurchaseOffer.reminderDaysBefore} days before each charge`));
  assert.ok(text.includes(postPurchaseOffer.cancellationLine[postPurchaseOffer.cancellationPolicy]));
  assert.ok(text.includes("$254.15") && text.includes("$239.20"));
});

test("entity placeholders are tracked until filled", () => {
  // Flip this to an empty-array assertion once the entity details are in.
  assert.ok(Array.isArray(legalPlaceholders()));
});
