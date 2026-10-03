import assert from "node:assert/strict";
import { test } from "node:test";
import { CODE128_PATTERNS, code128Values, code128Widths } from "../src/lib/pathology/code128";
import { PDFDocument } from "pdf-lib";
import { buildRequestFormPdf } from "../src/lib/pathology/request-form";

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

test("request form renders a PDF with the expected metadata", async () => {
  const bytes = await buildRequestFormPdf({
    reference: "SIG-TEST0001", issuedAt: new Date(Date.UTC(2026, 9, 3)), draft: true,
    patient: { firstName: "Sam", lastName: "Example", dob: "29/02/1992", sex: "Male", phone: "0412 345 678", email: "sam@example.com", address: "1 Example St, Sydney NSW 2000" },
    tests: [{ group: "The SIGNAL Test (32 markers)", items: ["Full blood count", "Ferritin", "Iron", "Transferrin", "Transferrin saturation", "Total cholesterol", "LDL cholesterol", "HDL cholesterol", "Triglycerides", "Non-HDL cholesterol", "Fasting glucose", "HbA1c", "ALT", "AST", "ALP", "GGT", "Bilirubin", "Albumin", "Total protein", "Creatinine", "eGFR", "Urea", "Sodium", "Potassium", "Chloride", "Bicarbonate", "TSH", "hs-CRP", "Calcium", "Magnesium", "Phosphate", "Uric acid"] }, { group: "Hormones+ (7 markers)", items: ["Total testosterone", "SHBG", "Free testosterone", "LH", "FSH", "Oestradiol", "Prolactin"] }],
    collectionMethod: "Collection centre",
    practice: { name: "Express Pathology", tradingAs: "SIGNAL by Express Pathology", address: "1 Test St", phone: "02 0000 0000", email: "x@y.z" },
    requester: { name: "Dr Test Doctor", qualifications: "MBBS", providerNumber: "1234567A", authorisation: "Electronically authorised." },
    lab: { name: "Test Lab", billing: "Private.", accountNumber: "ACC1" },
    clinicalNotes: "Self-requested health assessment.",
    fasting: { required: true, instruction: "Fast 10 to 12 hours.", bring: "Bring photo ID." },
  });
  const head = Buffer.from(bytes.slice(0, 8)).toString("latin1");
  assert.ok(head.startsWith("%PDF-1."), head);
  assert.ok(bytes.length > 2000);
  const loaded = await PDFDocument.load(bytes);
  assert.equal(loaded.getTitle(), "Pathology request SIG-TEST0001");
  assert.equal(loaded.getPageCount(), 1);
});
