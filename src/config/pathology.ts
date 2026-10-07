/**
 * Pathology request form: the Express Pathology Commercial Pathology Request
 * Form, generated per order at payment, attached to the confirmation email and
 * downloadable from the order page.
 *
 * This is a commercial (non-Medicare) referral. The referrer is the company,
 * not an individual practitioner, and the laboratory bills Express Pathology
 * using the account codes below. The patient must never be billed.
 *
 * DECISION (clinical governance): `issue` = "auto" issues the form at payment
 * under the company's commercial arrangement; "review" means the form is only
 * sent after a doctor approves the order (needs the dashboard).
 */
export interface ParticipatingLab {
  /** Short name used in strips and the codes table. */
  name: string;
  /** Legal name printed on the collection-instructions page. */
  legalName: string;
  /** Referring doctor / account code the laboratory keys the request to. */
  drCode: string;
  /** Billing code the laboratory invoices against. */
  billingCode: string;
  /** The laboratory's own collection-centre finder. TODO-VERIFY both links on launch day. */
  finderUrl: string;
  finderLabel: string;
  /** States and territories where the laboratory has collection centres. */
  coverage: string;
  /** One line a customer needs to know before walking in. */
  note: string;
}

export const pathologyConfig = {
  issue: "auto" as "auto" | "review",
  formTitle: "Commercial Pathology Request Form",
  referrer: {
    legalName: "Express Pathology Pty Ltd",
    name: "Express Pathology",
    tradingAs: "SIGNAL by Express Pathology",
    email: "express@expresspathology.com.au",
    phone: "02 9545 2940",
    website: "expresspathology.com.au",
    /** Overridden at generation time with the site's own /collect page. */
    locationsUrl: "signaltest.com.au/collect",
  },
  /** Only these laboratories may accept the form. Order = display order. */
  labs: [
    {
      name: "4Cyte Pathology", legalName: "4Cyte Pathology Pty Ltd", drCode: "9EXP", billingCode: "9EXP",
      finderUrl: "https://www.4cyte.com.au/OurLocations.php", finderLabel: "Find a 4Cyte centre",
      coverage: "NSW, VIC, QLD and WA",
      note: "Walk in during opening hours. Many centres are inside medical practices; ask reception for the 4Cyte collection room.",
    },
    {
      name: "Australian Clinical Labs", legalName: "Australian Clinical Labs", drCode: "BR479", billingCode: "N1687",
      finderUrl: "https://www.clinicallabs.com.au/locations", finderLabel: "Find a Clinical Labs centre",
      coverage: "NSW, VIC, QLD, WA, SA, ACT and NT",
      note: "Walk in during opening hours. Look for the Clinical Labs sign; some centres are branded Clinical Labs rather than Australian Clinical Labs.",
    },
  ] as ParticipatingLab[],
  billing: {
    headline: "COMMERCIAL ACCOUNT · BILL TO EXPRESS PATHOLOGY · DO NOT BILL THE PATIENT",
    body: "The patient has paid Express Pathology in full. Bill the laboratory using the codes in the bottom-left of this form.",
    footer: "DO NOT BILL THE PATIENT · PATIENT HAS PAID IN FULL · BILL EXPRESS PATHOLOGY USING THE CODES ABOVE",
  },
  compliance: [
    "Commercial / Non-Medicare",
    "This form is only to be accepted at one of the laboratories listed above",
    "Collector + D/E — Do not alter the ID details on this referral. It is meant to be as is.",
  ],
  collectorCertification:
    "I certify that I collected the accompanying sample from the patient named above whose identity I confirmed by enquiry, and labelled the sample immediately following collection.",
  /** Printed in the Notes box on every form. Order-specific notes are appended. */
  notes: "Results to Express Pathology (express@expresspathology.com.au). Patient copy issued via SIGNAL.",
  collection: {
    /** The base panel includes fasting glucose and lipids. */
    fastingRequired: true,
    fastingInstruction: "Fast for 10 to 12 hours before collection. Water is fine. Take usual medications unless your doctor has said otherwise. Morning collection is best.",
    bring: "Bring photo ID and this form, printed or on your phone.",
    /** Patient / phlebotomist page. */
    instructions: {
      title: "Collection instructions",
      thanks: "Thank you for choosing Express Pathology. Present this form and photo ID at any 4Cyte Pathology or Australian Clinical Labs collection centre. No appointment or referral from your GP is needed.",
      commercialNote: "This is a commercial account request. Your test has been paid in full. If a collection centre attempts to bill you or asks for a Medicare card for billing, do not pay: show them the billing notice on page 1 or call us on {phone}.",
      validAt: "This form is only valid at the collection centres of the following participating laboratories:",
      footer: "Only attend a 4Cyte Pathology or Australian Clinical Labs collection centre. Any other laboratory will not accept this form and may bill you for the test.",
      /* Page 2 of the printed form, as on the Express Pathology template. */
      findTitle: "Find your nearest collection centre",
      findBody: "Please visit",
      qrCaption: "Scan to find your nearest collection centre",
      collectorTitle: "For the attention of phlebotomist / collector",
      collectorBody: [
        "Thank you for taking care of our Express Pathology customers. Without you we would not be able to provide this service to our customers in Australia.",
        "Express Pathology has commercial accounts with the laboratories listed below and the customer has already paid for this test in full.",
        "If you need anything clarified please contact your laboratory's commercial department or area coordinator, or reach Express Pathology on {phone}.",
        "This pathology request form is only valid at the collection centres of the following participating laboratories and should not be submitted to, nor accepted by, any other laboratory than:",
      ],
      closing: ["Express Pathology has commercial accounts with the laboratories above.", "THE CUSTOMER HAS ALREADY PAID FOR THIS TEST IN FULL · DO NOT BILL THE PATIENT"],
      customerTitle: "Collection centres — note to customer",
      customerBody: "Only attend collection centres of the laboratories listed on {locationsUrl} to avoid being billed for this test again.",
    },
  },
};
