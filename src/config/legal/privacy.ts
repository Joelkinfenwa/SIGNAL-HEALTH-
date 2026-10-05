import { legalEntity as e } from "./entity";
import type { LegalDocument } from "./types";

/**
 * Privacy Policy. DRAFT prepared against the Australian Privacy Principles
 * and the way the site actually handles data (see docs/ARCHITECTURE.md §7–8).
 * Health information is sensitive information under the Privacy Act 1988.
 */
export const privacy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  intro: `${e.legalName} (ABN ${e.abn}), trading as ${e.tradingName}, is bound by the Privacy Act 1988 (Cth) and the Australian Privacy Principles. Your test results and the clinical review are health information, which the law treats as sensitive information. This policy explains what we collect, why, who we share it with, and your rights.`,
  sections: [
    { id: "collect", title: "1. What we collect", body: [
      "- Identity and contact details: name, date of birth, sex as recorded at birth, gender if you choose to tell us, email, mobile number, postcode and, for a home visit, your address.",
      "- Order details: the tests and add-ons you chose, your collection choice, the amount paid and, if you choose Automatic Retesting, your plan and the consent you gave.",
      "- Health information: your pathology results, the reviewing doctor's report and plan, and any information you give us about your health that is needed to interpret them.",
      "- Payment: handled by Stripe. We receive a payment reference and the last four digits of your card, never the full card number.",
      "- Website use: pages visited, device and browser type, and the campaign or landing page you arrived from, collected through first-party analytics and cookies described in section 7.",
    ]},
    { id: "why", title: "2. Why we collect it", body: [
      "- To arrange your pathology request, collection, laboratory analysis and medical review, and to deliver your results and plan.",
      "- To contact you about your order, your booking, urgent results and, if you opt in, retesting reminders and offers.",
      "- To take payment, issue refunds and keep the financial records the law requires.",
      "- To run and improve the service and, with your consent, to send you marketing by email. You can withdraw that consent at any time using the unsubscribe link.",
      "We collect health information only with your consent, which you give when you place an order, and only for the purposes above.",
    ]},
    { id: "share", title: "3. Who we share it with", body: [
      "- The accredited pathology laboratory that analyses your sample and the collection service that takes it. They receive your name, date of birth, sex, contact details and the tests requested, and return your results to us.",
      "- The Australian-registered medical practitioner who reviews your results.",
      "- Stripe, which processes payments and, for Automatic Retesting, stores your payment method and billing schedule. Stripe is certified to PCI DSS Level 1.",
      "- Service providers that host our website, send our emails and SMS, and store our records, under contracts that require them to protect your information.",
      "- Anyone you ask us to share results with, such as your GP, and anyone the law requires us to share them with.",
      "We never sell personal information. Advertising platforms such as Meta and Google receive only that a purchase occurred, its value, an order reference and, to match the purchase to the advertisement you saw, a hashed (scrambled, one-way) version of your email address. They never receive your name in clear text, your test selection or any health information.",
    ]},
    { id: "overseas", title: "4. Overseas disclosure", body: [
      "Your pathology analysis and medical review take place in Australia. Some of our service providers, including Stripe and our website host, store data in the United States and other countries. We take reasonable steps to ensure they handle your information in a way consistent with the Australian Privacy Principles.",
    ]},
    { id: "security", title: "5. Storage and security", body: [
      "Health information is stored in systems protected by encryption in transit and at rest, access controls and audit logging, to standards consistent with Australian health records. We keep health records for the period required by law, currently seven years from the last entry for adults, and delete or de-identify other personal information when it is no longer needed.",
      "If a data breach is likely to cause you serious harm we will notify you and the Office of the Australian Information Commissioner under the Notifiable Data Breaches scheme.",
    ]},
    { id: "rights", title: "6. Access, correction and deletion", body: [
      `You can access and correct your personal information, and ask us to delete information we are not required to keep, by emailing ${e.privacyEmail}. We respond within 30 days. Where we cannot delete health records because the law requires us to keep them, we will tell you and restrict their use.`,
    ]},
    { id: "cookies", title: "7. Cookies and analytics", body: [
      "We use first-party cookies to remember your choices during checkout, to record the campaign you arrived from so we can measure our advertising, and for site analytics. Analytics events never contain your name, your test selection or health information. Our checkout stores the details you type in your browser's session storage until payment so a page reload does not lose them; this is cleared when you close the tab.",
      "You can block cookies in your browser; checkout will still work.",
    ]},
    { id: "marketing", title: "8. Marketing", body: [
      "We send marketing email only if you tick the box at checkout or subscribe elsewhere, in line with the Spam Act 2003. Every message includes an unsubscribe link. Service messages about your order, booking, results and billing are not marketing and are sent regardless.",
    ]},
    { id: "complaints", title: "9. Complaints", body: [
      `If you have a concern about how we have handled your information, email ${e.privacyEmail} and we will investigate and respond within 30 days. If you are not satisfied you can complain to the Office of the Australian Information Commissioner at oaic.gov.au.`,
    ]},
    { id: "changes", title: "10. Changes and contact", body: [
      `We may update this policy; the current version is always at this address with its date. Contact: ${e.privacyEmail}, ${e.legalName}, ${e.address}.`,
    ]},
  ],
};
