/**
 * Checkout "Your details" copy and options. What the laboratory and the
 * booking team need from a customer, and nothing more.
 *
 * Wording decisions to confirm before launch (see README claims register):
 *  - Sex is asked as recorded at birth because laboratories apply
 *    sex-specific reference ranges. Gender is optional and separate.
 *  - Minimum age. Self-pay testing for under-18s is a policy decision.
 * TODO-VERIFY both with the clinical lead and legal.
 */
export const MIN_AGE_YEARS = 18;

export type SexId = "female" | "male" | "other";
export type GenderId = "woman" | "man" | "non_binary" | "self_describe" | "prefer_not";

export const sexOptions: { id: SexId; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "other", label: "Intersex or another term" },
];

export const genderOptions: { id: GenderId; label: string }[] = [
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "non_binary", label: "Non-binary" },
  { id: "self_describe", label: "Prefer to self-describe" },
  { id: "prefer_not", label: "Prefer not to say" },
];

export const australianStates = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;
export type StateId = (typeof australianStates)[number];

export const detailsCopy = {
  title: "Your details",
  intro: "The laboratory needs these to process your sample and match results to you. Use the name on your ID.",
  name: { legend: "Legal name", first: "First name", last: "Last name", help: "As it appears on your photo ID. Collectors check it when you're collected." },
  dob: { legend: "Date of birth", day: "Day", month: "Month", year: "Year", help: "Used on your pathology request and to check your identity at collection." },
  sex: {
    legend: "Sex",
    help: "As recorded at birth. Laboratories use it to apply the right reference ranges to your results. It doesn't need to match your gender.",
  },
  gender: { label: "Gender", optional: "optional", help: "How you'd like us to refer to you. Never shared with advertising platforms." },
  email: { label: "Email", help: "Your confirmation, request form and results notification go here." },
  phone: { label: "Mobile", help: "For booking reminders and if the collector needs to reach you." },
  address: {
    legend: "Home address",
    help: "Printed on your pathology request form so the laboratory can match your sample to you. For at-home collection it's also where the collector comes to. Street address, not a PO box.",
    line1: "Street address",
    line2: "Unit, level or building",
    suburb: "Suburb",
    state: "State",
    postcode: "Postcode",
  },
  postcodeOnly: { label: "Postcode", help: "So we can show collection centres near you." },
  consent: {
    terms: "I agree to the Terms of Service and Privacy Policy, and to my details being shared with the laboratory and collection team to carry out my test.",
    marketing: "Send me occasional updates and offers from SIGNAL by email. You can unsubscribe any time.",
  },
  errors: {
    required: "Required",
    firstName: "Enter your first name",
    lastName: "Enter your last name",
    dobInvalid: "Enter a valid date of birth",
    dobFuture: "Date of birth can't be in the future",
    dobAge: `You need to be ${MIN_AGE_YEARS} or over to order`,
    sex: "Choose one",
    email: "Enter a valid email address",
    phone: "Enter a valid Australian mobile number",
    postcode: "Enter a 4-digit postcode",
    line1: "Enter a street address",
    suburb: "Enter a suburb",
    state: "Choose a state",
    terms: "You need to agree before you can pay",
  },
  summaryError: (n: number) => (n === 1 ? "One detail needs your attention" : `${n} details need your attention`),
};
