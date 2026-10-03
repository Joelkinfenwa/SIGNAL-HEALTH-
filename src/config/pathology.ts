/**
 * Pathology request form. Generated per order at payment, attached to the
 * confirmation email and downloadable from the order page.
 *
 * The requesting practitioner is the practice's doctor. Fill every bracketed
 * value before launch; the PDF carries a "DRAFT" watermark while any remain.
 *
 * DECISION (clinical governance): `issue` = "auto" issues the request at
 * payment under the practice's standing arrangement; "review" means the
 * form is only sent after a doctor approves the order (needs the dashboard).
 * Confirm the arrangement with the practice before launch.
 */
export const pathologyConfig = {
  issue: "auto" as "auto" | "review",
  practice: {
    name: "Express Pathology",
    tradingAs: "SIGNAL by Express Pathology",
    address: "[Practice address]",
    phone: "[Practice phone]",
    email: "[support email]",
  },
  requester: {
    name: "[Requesting doctor full name]",
    qualifications: "[e.g. MBBS, FRACGP]",
    providerNumber: "[Provider number]",
    /** Printed under the signature line. */
    authorisation: "Electronically authorised by the requesting practitioner under the practice's SIGNAL protocol.",
  },
  lab: {
    name: "[Pathology laboratory name]",
    /** Printed for the collector: how the account is billed. */
    billing: "Private request. Bill to the SIGNAL by Express Pathology account. Do not bill the patient or Medicare.",
    /** Optional lab account or client number. */
    accountNumber: "[Lab account number]",
  },
  clinicalNotes: "Self-requested comprehensive health assessment (SIGNAL). Results to requesting practitioner for review; patient copy via SIGNAL.",
  collection: {
    /** The base panel includes fasting glucose and lipids. */
    fastingRequired: true,
    fastingInstruction: "Fast for 10 to 12 hours before collection. Water is fine. Take usual medications unless your doctor has said otherwise. Morning collection is best.",
    bring: "Bring photo ID and this form, printed or on your phone.",
  },
};

export const pathologyPlaceholders = () =>
  [
    ...Object.entries(pathologyConfig.practice).map(([k, v]) => [`practice.${k}`, v] as const),
    ...Object.entries(pathologyConfig.requester).map(([k, v]) => [`requester.${k}`, v] as const),
    ...Object.entries(pathologyConfig.lab).map(([k, v]) => [`lab.${k}`, v] as const),
  ].filter(([, v]) => /^\[.*\]$/.test(v)).map(([k]) => k);
