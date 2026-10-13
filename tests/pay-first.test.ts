import assert from "node:assert/strict";
import { test } from "node:test";
import { completeDetailsEmail } from "../src/lib/email/complete-details";
import { detailsComplete } from "../src/lib/orders/metadata";

test("details status: pay-first customers are pending until the details step marks them complete", () => {
  assert.equal(detailsComplete({ metadata: { details_status: "pending", consent_terms: "1" } }), false);
  assert.equal(detailsComplete({ metadata: { details_status: "complete" } }), true);
  assert.equal(detailsComplete(null), false);
});

test("details status: orders made before the flag existed count as complete when the identity fields are present", () => {
  assert.equal(detailsComplete({ metadata: { first_name: "Sam", last_name: "Example", dob: "1992-02-29", sex: "male" } }), true);
  assert.equal(detailsComplete({ metadata: { first_name: "Sam", last_name: "Example" } }), false);
});

test("complete-your-details email: links to the order, never attaches a form, reminder variant is distinct", () => {
  const first = completeDetailsEmail({ reference: "#2051", orderUrl: "https://example.test/order/pi_1?t=abc", amountCents: 29900, reminder: false });
  const again = completeDetailsEmail({ reference: "#2051", orderUrl: "https://example.test/order/pi_1?t=abc", amountCents: 29900, reminder: true });
  for (const m of [first, again]) {
    assert.ok(m.text.includes("https://example.test/order/pi_1?t=abc"));
    assert.ok(m.html.includes("https://example.test/order/pi_1?t=abc"));
    assert.ok(m.text.includes("$299"));
    assert.ok(!/attached/i.test(m.text));
  }
  assert.notEqual(first.subject, again.subject);
  assert.match(again.subject, /reminder/i);
});
