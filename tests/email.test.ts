import assert from "node:assert/strict";
import { test } from "node:test";
import { orderConfirmationEmail } from "../src/lib/email/order-confirmation";

const base = { reference: "SIG-TEST0001", orderId: "pi_x", orderUrl: "https://signaltest.com.au/order/pi_x?t=abc", formAttached: true, formUrl: "https://signaltest.com.au/api/orders/pi_x/request-form?t=abc", amountCents: 29900, lines: [{ label: "The SIGNAL Test", priceCents: 29900 }], offerDeadline: new Date(Date.UTC(2026, 9, 8, 7)), firstName: "Sam", phone: "0412 345 678", address: "1 Example St, Sydney, NSW, 2000" };

test("centre confirmation: walk-in instructions, form attached, no booking promise", () => {
  const m = orderConfirmationEmail({ ...base, collectionMethodId: "centre" });
  assert.match(m.subject, /request form is attached/);
  for (const s of ["Find a collection centre", "https://signaltest.com.au/collect", "4Cyte Pathology", "Australian Clinical Labs", "Any other laboratory will not accept your form", "Fast for 10 to 12 hours", "photo ID", "already paid for", "Around 7 days", "02 9545 2940", "SIG-TEST0001", "$299", "Automatic Retesting"]) assert.ok(m.text.includes(s) && m.html.includes(s.replace(/'/g, "&#39;").split("'")[0]!), s);
  for (const banned of ["booking link", "dashboard", "We'll call you"]) assert.ok(!m.text.includes(banned), banned);
});

test("home-visit confirmation: we call, address and phone, coverage refund, no centre CTA", () => {
  const m = orderConfirmationEmail({ ...base, collectionMethodId: "mobile", amountCents: 39800, lines: [...base.lines, { label: "At home or work", priceDeltaCents: 9900, priceCents: 9900 } as never] });
  assert.match(m.subject, /call to arrange your home visit/);
  for (const s of ["We'll call you on 0412 345 678", "1 Example St, Sydney, NSW, 2000", "refund the $99 visit fee", "collector will ask for it", "Nothing is owed on the day"]) assert.ok(m.text.includes(s), s);
  assert.ok(!m.text.includes("Find a collection centre"));
  assert.ok(!m.html.includes("/collect"));
});

test("no form yet: says the team will email it, no download link", () => {
  const m = orderConfirmationEmail({ ...base, collectionMethodId: "centre", formAttached: false, formUrl: undefined });
  assert.match(m.subject, /is confirmed\.$/);
  assert.ok(m.text.includes("preparing your pathology request form"));
  assert.ok(!m.html.includes("Download your request form"));
});
