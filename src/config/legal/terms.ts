import { signalTest } from "../products";
import { getCollectionMethod } from "../collection";
import { postPurchaseOffer } from "../retest-offer";
import { formatAUD } from "../../lib/money";
import { legalEntity as e } from "./entity";
import type { LegalDocument } from "./types";

const price = signalTest.priceCents !== null ? formatAUD(signalTest.priceCents) : "the listed price";
const homeVisit = getCollectionMethod("mobile").priceDeltaCents;

/**
 * Terms of Service. DRAFT prepared from the product as built, for review by
 * an Australian lawyer before launch. Nothing here limits rights under the
 * Australian Consumer Law.
 */
export const terms: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  intro: `These terms govern your purchase and use of the SIGNAL Test and related services from ${e.legalName} (ABN ${e.abn}), trading as ${e.tradingName} ("we", "us"). By placing an order you agree to them. Please read them with our Privacy Policy and, if you choose Automatic Retesting, the Retesting Terms.`,
  sections: [
    { id: "service", title: "1. What SIGNAL is", body: [
      "SIGNAL is a self-requested pathology testing service. When you order, we arrange a pathology request for the markers in your chosen configuration, your sample is collected at a partner collection centre or by a mobile collector, it is analysed by an accredited Australian pathology laboratory, and your results are reviewed by an Australian-registered medical practitioner who prepares a plain-English written explanation of your results.",
      "SIGNAL is not a substitute for your general practitioner or for emergency care. It does not diagnose or treat any condition, and a report is not a consultation or a prescription. If you are unwell, or if your report says a result needs prompt attention, see a doctor. In an emergency call 000.",
    ]},
    { id: "eligibility", title: "2. Who can order", body: [
      "You must be 18 or over, located in Australia, and ordering for yourself. You must give accurate identity and contact details: the name on your order must match the photo ID you present at collection, and your date of birth and sex as recorded at birth are used on the pathology request so the laboratory applies the correct reference ranges.",
    ]},
    { id: "ordering", title: "3. Ordering and price", body: [
      `The price of each item is shown in Australian dollars, inclusive of GST where it applies, before you pay. At the date of these terms the SIGNAL Test is ${price}, add-ons are priced individually, collection at a centre is included, and a home or workplace visit is ${homeVisit !== null ? formatAUD(homeVisit) : "priced"} where available. The amount charged is the total shown at checkout.`,
      "Payment is taken at the time of order by card, Apple Pay or Google Pay through Stripe. We do not store your card details. A contract is formed when payment succeeds and you receive your confirmation.",
      "SIGNAL is a private service. It is not billed to Medicare and we make no claim on your behalf to any health fund.",
    ]},
    { id: "collection", title: "4. Collection", body: [
      "After payment you receive a link to book your collection at a time and place that suit you. Home and workplace visits are available in selected areas only; if a visit cannot be provided in your area you may choose a collection centre or a full refund of the visit fee.",
      "Please bring photo ID. Follow any preparation instructions in your booking (for example fasting). If you miss a booking or cancel with less than the notice stated in your booking confirmation, a rebooking fee may apply as stated there.",
    ]},
    { id: "results", title: "5. Results, review and timing", body: [
      "Most results and the doctor's review are sent to your email address as a secure link within 5 days of collection. Occasionally a laboratory needs longer or must recollect a sample; we will tell you if that happens and there is no extra charge for a recollection the laboratory requests.",
      "A laboratory result is a measurement at a point in time. Reference ranges are population-based and a result outside a range does not by itself mean something is wrong, nor does a result within a range guarantee that nothing is. The reviewing doctor's report is general guidance based on your results and the information you supplied; it is not a diagnosis and does not establish an ongoing treating relationship.",
      "If a result requires urgent attention we will contact you using the details on your order. Keep them current.",
    ]},
    { id: "cancellation", title: "6. Changing or cancelling an order", body: [
      "You may cancel for a full refund at any time before your blood is collected by emailing us. After collection the laboratory work has begun and the order can no longer be cancelled, except under the guarantee below or your rights under the Australian Consumer Law.",
      "Add-ons can be added or removed before payment. To change add-ons after payment but before collection, email us and we will adjust the order and the amount paid.",
    ]},
    { id: "guarantee", title: "7. Clear Explanation or It's Free guarantee", body: [
      `If, after your blood draw and the doctor's review, you feel the written explanation of your results was not clear, email ${e.supportEmail} within 7 days of your report being released and we will refund the ${price} test fee in full. The guarantee covers the SIGNAL Test fee; add-ons and collection fees are refunded if you cancel before collection under section 6. One claim per order. The guarantee concerns the clarity of the explanation only; it is not a promise about your health, your results or any treatment. This guarantee is in addition to, and does not limit, your rights under the Australian Consumer Law.`,
    ]},
    { id: "retesting", title: "8. Automatic Retesting", body: [
      `Automatic Retesting is optional and is offered after your first purchase. It uses recurring billing. If you choose it, the Retesting Terms apply in addition to these terms, including the refund of the plan discount against your first order, the recurring charge for each future test, the reminder we send ${postPurchaseOffer.reminderDaysBefore} days before each charge, and your right to change, pause or cancel at any time.`,
    ]},
    { id: "consumer-law", title: "9. Australian Consumer Law", body: [
      "Our services come with guarantees that cannot be excluded under the Australian Consumer Law. For major failures you are entitled to cancel the service and receive a refund for the unused portion, or compensation for its reduced value, and to compensation for any other reasonably foreseeable loss or damage. For failures that are not major you are entitled to have the problem fixed within a reasonable time or, if that does not happen, to cancel and receive a refund for the unused portion.",
      "Nothing in these terms excludes, restricts or modifies any right or remedy you have under that law or any other law that cannot be excluded.",
    ]},
    { id: "liability", title: "10. Our responsibility", body: [
      "To the extent permitted by law, and subject to section 9, we are not liable for loss arising from inaccurate information you supply, from your failure to follow preparation or booking instructions, from decisions you make without consulting a doctor, or for indirect or consequential loss. Where liability cannot be excluded but can be limited, it is limited to re-supplying the service or refunding the amount you paid for it.",
    ]},
    { id: "accounts", title: "11. Your results and records", body: [
      "Your results are delivered to the email address on your order as a secure link. Keep that email address secure and tell us if you believe it has been compromised. You may ask us to export or delete your records in accordance with our Privacy Policy and our record-keeping obligations for health information.",
    ]},
    { id: "general", title: "12. General", body: [
      "We may update these terms; the version in force when you order applies to that order. If any part is unenforceable the rest continues. These terms are governed by the laws of " + e.jurisdiction + ", and you submit to the non-exclusive jurisdiction of its courts.",
      `Questions: ${e.supportEmail}. ${e.legalName}, ${e.address}.`,
    ]},
  ],
};
