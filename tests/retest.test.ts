import assert from "node:assert/strict";
import { test } from "node:test";
import { retestOffers } from "../src/config/retest-offer";
import type { QuoteLine } from "../src/lib/pricing";
import { addMonths, fillOfferTokens, quoteRetest, quoteRetestForOrder } from "../src/lib/retest/offer";

const lines: QuoteLine[] = [
  { kind: "product", id: "signal", label: "The SIGNAL Test", priceCents: 34900 },
  { kind: "addon", id: "hormones_plus", label: "Hormones+", priceCents: 5900 },
  { kind: "collection", id: "mobile", label: "At home or work", priceCents: 4900 },
];
const six = retestOffers.find((o) => o.id === "retest_6m")!;
const three = retestOffers.find((o) => o.id === "retest_3m")!;

test("refund equals the plan discount on today's order, excluding the collection fee", () => {
  const q6 = quoteRetestForOrder(lines, six);
  assert.equal(q6.eligibleCents, 40800);
  assert.equal(q6.refundTodayCents, 6120); // 15% of 408.00
  assert.equal(q6.recurringPriceCents, 34680);
  const q3 = quoteRetestForOrder(lines, three);
  assert.equal(q3.refundTodayCents, 8160); // 20%
  assert.equal(q3.recurringPriceCents, 32640);
});

test("displayed refund and recurring price are the same integer maths the server will use", () => {
  const q = quoteRetest(40800, three);
  assert.equal(q.discountCents + q.recurringPriceCents, 40800);
  assert.equal(q.refundTodayCents, q.discountCents);
  assert.equal(quoteRetest(10001, six).discountCents, 1500); // rounds, never floats
});

test("next test date adds whole months and clamps the day", () => {
  assert.equal(addMonths(new Date(Date.UTC(2026, 0, 31)), 1).toISOString().slice(0, 10), "2026-02-28");
  assert.equal(addMonths(new Date(Date.UTC(2026, 8, 30)), 6).toISOString().slice(0, 10), "2027-03-30");
  assert.equal(addMonths(new Date(Date.UTC(2026, 8, 30)), 3).toISOString().slice(0, 10), "2026-12-30");
});

test("offer copy tokens fill with formatted money, interval and date", () => {
  const s = fillOfferTokens("Get {refund} back. Then {price} every {interval} from {date}. {discount} off. {reminder} days.", {
    refund: 6120, paid: 45700, price: 34680, intervalMonths: 6, discountBps: 1500, nextDate: new Date(Date.UTC(2027, 2, 30, 12)), reminderDays: 14,
  });
  assert.equal(s, "Get $61.20 back. Then $346.80 every 6 months from 30 March 2027. 15% off. 14 days.");
});
