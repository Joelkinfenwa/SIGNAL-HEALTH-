import assert from "node:assert/strict";
import { test } from "node:test";
import { detailsCopy } from "../src/config/checkout-fields";
import { ageOn, emptyCustomer, isAustralianMobile, normaliseCustomer, normalisePhone, parseDob, validateCustomer } from "../src/lib/checkout/customer";

const msgs = detailsCopy.errors;
const today = new Date(Date.UTC(2026, 8, 30));
const good = () => ({
  ...emptyCustomer(),
  firstName: "Sam", lastName: "Lee", dobDay: "29", dobMonth: "2", dobYear: "1992", sex: "female" as const,
  email: "Sam@Example.com", phone: "+61 412 345 678", postcode: "2000", acceptsTerms: true,
});

test("parseDob accepts real dates only", () => {
  assert.equal(parseDob("29", "2", "1992"), "1992-02-29");
  assert.equal(parseDob("29", "2", "1993"), null);
  assert.equal(parseDob("31", "4", "1990"), null);
  assert.equal(parseDob("1", "1", "90"), null);
  assert.equal(parseDob("", "", ""), null);
});

test("age is computed correctly around birthdays", () => {
  assert.equal(ageOn("2008-09-30", today), 18);
  assert.equal(ageOn("2008-10-01", today), 17);
});

test("australian mobile numbers normalise and validate", () => {
  assert.equal(normalisePhone("+61 412 345 678"), "0412345678");
  assert.equal(normalisePhone("0412-345-678"), "0412345678");
  assert.ok(isAustralianMobile("0412 345 678"));
  assert.ok(!isAustralianMobile("02 9876 5432"));
  assert.ok(!isAustralianMobile("041234567"));
});

test("a complete centre-collection customer validates; missing fields are named", () => {
  assert.deepEqual(validateCustomer(good(), { requiresAddress: false, today }, msgs), {});
  const e = validateCustomer(emptyCustomer(), { requiresAddress: false, today }, msgs);
  assert.deepEqual(Object.keys(e).sort(), ["acceptsTerms", "dobDay", "email", "firstName", "lastName", "phone", "postcode", "sex"]);
});

test("at-home collection requires a street address", () => {
  const e = validateCustomer(good(), { requiresAddress: true, today }, msgs);
  assert.deepEqual(Object.keys(e).sort(), ["addressLine1", "state", "suburb"]);
  const ok = validateCustomer({ ...good(), addressLine1: "1 Example St", suburb: "Sydney", state: "NSW" }, { requiresAddress: true, today }, msgs);
  assert.deepEqual(ok, {});
});

test("under-18 and future dates of birth are rejected", () => {
  assert.equal(validateCustomer({ ...good(), dobDay: "1", dobMonth: "1", dobYear: "2010" }, { requiresAddress: false, today }, msgs).dobDay, msgs.dobAge);
  assert.equal(validateCustomer({ ...good(), dobDay: "1", dobMonth: "1", dobYear: "2027" }, { requiresAddress: false, today }, msgs).dobDay, msgs.dobFuture);
});

test("normalised customer is what the server stores", () => {
  const n = normaliseCustomer(good());
  assert.equal(n.email, "sam@example.com");
  assert.equal(n.phone, "0412345678");
  assert.equal(n.dob, "1992-02-29");
  assert.equal(n.address, undefined);
  assert.equal(n.gender, undefined);
});
