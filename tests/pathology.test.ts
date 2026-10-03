import assert from "node:assert/strict";
import { test } from "node:test";
import { CODE128_PATTERNS, code128Values, code128Widths } from "../src/lib/pathology/code128";
import { PDFDocument } from "pdf-lib";
import { buildRequestFormPdf } from "../src/lib/pathology/request-form";
import { pathologyConfig } from "../src/config/pathology";

test("Code 128 pattern table is well formed", () => {
  assert.equal(CODE128_PATTERNS.length, 107);
  CODE128_PATTERNS.forEach((p, i) => assert.equal(p.split("").reduce((a, b) => a + Number(b), 0), i === 106 ? 13 : 11, `pattern ${i}`));
});

test("Code 128 B checksum is start + weighted sum mod 103", () => {
  const v = code128Values("PJJ123C");
  assert.equal(v[0], 104);
  const expected = (104 + 48 * 1 + 42 * 2 + 42 * 3 + 17 * 4 + 18 * 5 + 19 * 6 + 35 * 7) % 103; // 55
  assert.equal(v[v.length - 2], expected);
  assert.equal(v[v.length - 1], 106);
  assert.throws(() => code128Values("é"));
  assert.ok(code128Widths("SIG-ABC12345").length > 0);
});

test("request form renders the two-page commercial form with the expected metadata", async () => {
  const bytes = await buildRequestFormPdf({
    reference: "SIG-TEST0001", issuedAt: new Date(Date.UTC(2026, 9, 3)),
    patient: { firstName: "Sam", lastName: "Example", dob: "29/02/1992", sex: "Male", phone: "0412 345 678", email: "sam@example.com", address: "1 Example St, Sydney NSW 2000" },
    tests: [{ group: "The SIGNAL Test (32 markers)", items: ["Full blood count", "Ferritin", "Iron", "Transferrin", "Transferrin saturation", "Total cholesterol", "LDL cholesterol", "HDL cholesterol", "Triglycerides", "Non-HDL cholesterol", "Fasting glucose", "HbA1c", "ALT", "AST", "ALP", "GGT", "Bilirubin", "Albumin", "Total protein", "Creatinine", "eGFR", "Urea", "Sodium", "Potassium", "Chloride", "Bicarbonate", "TSH", "hs-CRP", "Calcium", "Magnesium", "Phosphate", "Uric acid"] }, { group: "Hormones+ (7 markers)", items: ["Total testosterone", "SHBG", "Free testosterone", "LH", "FSH", "Oestradiol", "Prolactin"] }],
    fasting: true, notes: "Test notes.",
    formTitle: pathologyConfig.formTitle, referrer: pathologyConfig.referrer, labs: pathologyConfig.labs, billing: pathologyConfig.billing, compliance: pathologyConfig.compliance,
    collectorCertification: pathologyConfig.collectorCertification,
    collection: { fastingInstruction: "Fast 10 to 12 hours.", bring: "Bring photo ID.", instructions: pathologyConfig.collection.instructions },
  });
  const head = Buffer.from(bytes.slice(0, 8)).toString("latin1");
  assert.ok(head.startsWith("%PDF-1."), head);
  assert.ok(bytes.length > 2000);
  const loaded = await PDFDocument.load(bytes);
  assert.equal(loaded.getTitle(), "Express Pathology request SIG-TEST0001");
  assert.equal(loaded.getPageCount(), 2);
});

test("only 4Cyte and Australian Clinical Labs participate; no Healius brands or PathWest", () => {
  assert.deepEqual(pathologyConfig.labs.map((l) => l.name), ["4Cyte Pathology", "Australian Clinical Labs"]);
  const blob = JSON.stringify(pathologyConfig).toLowerCase();
  for (const banned of ["laverty", "qml", "dorevitch", "western diagnostic", "tml", "abbott", "pathwest", "healius", "provider number"]) assert.ok(!blob.includes(banned), banned);
  assert.equal(pathologyConfig.referrer.phone, "02 9545 2940");
  assert.equal(pathologyConfig.referrer.email, "express@expresspathology.com.au");
});
