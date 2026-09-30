/**
 * Customer details for checkout: types, normalisation and validation.
 * Pure functions, shared by the form (instant feedback) and the server action
 * (never trust the client). Relative imports so it runs under `node --test`.
 *
 * These are personal details (name, date of birth, sex). They live in the
 * form and, until payment, in sessionStorage only. They are never part of an
 * analytics event: the event types cannot carry them.
 */
import { australianStates, MIN_AGE_YEARS, type GenderId, type SexId, type StateId } from "../../config/checkout-fields";

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  /** Day, month and year as typed; validated with parseDob(). */
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  sex: SexId | "";
  gender: GenderId | "";
  email: string;
  phone: string;
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  suburb: string;
  state: StateId | "";
  acceptsTerms: boolean;
  marketingOptIn: boolean;
}

export type CustomerField = keyof CustomerDetails;
export type CustomerErrors = Partial<Record<CustomerField, string>>;

export const emptyCustomer = (): CustomerDetails => ({
  firstName: "", lastName: "",
  dobDay: "", dobMonth: "", dobYear: "",
  sex: "", gender: "",
  email: "", phone: "", postcode: "",
  addressLine1: "", addressLine2: "", suburb: "", state: "",
  acceptsTerms: false, marketingOptIn: false,
});

/** ISO date (YYYY-MM-DD) or null when the parts are not a real calendar date. */
export function parseDob(day: string, month: string, year: string): string | null {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  if (year.trim().length !== 4 || y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function ageOn(isoDob: string, today: Date): number {
  const [y, m, d] = isoDob.split("-").map(Number) as [number, number, number];
  let age = today.getUTCFullYear() - y;
  const beforeBirthday = today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Australian mobile: 04xx xxx xxx, +61 4xx xxx xxx, 0061… Digits only after normalisation. */
export function normalisePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+61")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("0061")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("61") && digits.length === 11) digits = "0" + digits.slice(2);
  return digits.replace(/\D/g, "");
}
export const isAustralianMobile = (raw: string) => /^04\d{8}$/.test(normalisePhone(raw));

export interface ValidateOptions {
  /** At-home collection needs a full address; a centre needs only a postcode. */
  requiresAddress: boolean;
  today?: Date;
}

export function validateCustomer(c: CustomerDetails, opts: ValidateOptions, msgs: Record<string, string>): CustomerErrors {
  const e: CustomerErrors = {};
  const today = opts.today ?? new Date();
  if (!c.firstName.trim()) e.firstName = msgs.firstName!;
  if (!c.lastName.trim()) e.lastName = msgs.lastName!;
  const dob = parseDob(c.dobDay, c.dobMonth, c.dobYear);
  if (!dob) e.dobDay = msgs.dobInvalid!;
  else if (new Date(dob) > today) e.dobDay = msgs.dobFuture!;
  else if (ageOn(dob, today) < MIN_AGE_YEARS) e.dobDay = msgs.dobAge!;
  if (!c.sex) e.sex = msgs.sex!;
  if (!EMAIL.test(c.email.trim())) e.email = msgs.email!;
  if (!isAustralianMobile(c.phone)) e.phone = msgs.phone!;
  if (!/^\d{4}$/.test(c.postcode.trim())) e.postcode = msgs.postcode!;
  if (opts.requiresAddress) {
    if (!c.addressLine1.trim()) e.addressLine1 = msgs.line1!;
    if (!c.suburb.trim()) e.suburb = msgs.suburb!;
    if (!(australianStates as readonly string[]).includes(c.state)) e.state = msgs.state!;
  }
  if (!c.acceptsTerms) e.acceptsTerms = msgs.terms!;
  return e;
}

export const isCustomerValid = (c: CustomerDetails, opts: ValidateOptions, msgs: Record<string, string>) =>
  Object.keys(validateCustomer(c, opts, msgs)).length === 0;

/** What the server stores: trimmed, normalised, with an ISO date of birth. */
export function normaliseCustomer(c: CustomerDetails) {
  return {
    firstName: c.firstName.trim(),
    lastName: c.lastName.trim(),
    dob: parseDob(c.dobDay, c.dobMonth, c.dobYear),
    sex: c.sex,
    gender: c.gender || undefined,
    email: c.email.trim().toLowerCase(),
    phone: normalisePhone(c.phone),
    postcode: c.postcode.trim(),
    address: c.addressLine1.trim()
      ? { line1: c.addressLine1.trim(), line2: c.addressLine2.trim() || undefined, suburb: c.suburb.trim(), state: c.state, postcode: c.postcode.trim() }
      : undefined,
    consents: { terms: c.acceptsTerms, marketingEmail: c.marketingOptIn },
  };
}
export type NormalisedCustomer = ReturnType<typeof normaliseCustomer>;
