/**
 * Order confirmation email copy. Two variants, chosen by collection method:
 * "centre" (walk in with the form) and "mobile" (we call to arrange a visit).
 * Tokens: {firstName} {reference} {phone} {address} {visitFee} {callWithin}
 * {deadline} {supportPhone} {supportEmail}. Prices never typed here.
 */
export const confirmationEmail = {
  brand: "SIGNAL by Express Pathology",
  subject: {
    centre: "Your SIGNAL order {reference} is confirmed. Your request form is attached.",
    mobile: "Your SIGNAL order {reference} is confirmed. We'll call to arrange your home visit.",
    noForm: "Your SIGNAL order {reference} is confirmed.",
  },
  headline: "Thanks, {firstName}. Your SIGNAL Test is ordered.",
  headlineNoName: "Thank you. Your SIGNAL Test is ordered.",
  lead: {
    centre: "Everything you need is in this email. Your pathology request form is attached, and you can walk into any participating collection centre whenever suits you. No appointment needed.",
    mobile: "Everything you need is in this email. We'll call you to arrange a time for your collector to come to you, and your pathology request form is attached for them.",
  },
  nextStep: {
    centre: {
      title: "Your next step: get your blood drawn",
      body: "Take your request form, printed or on your phone, and photo ID to any 4Cyte Pathology or Australian Clinical Labs collection centre. No appointment, no referral. Walk in during opening hours.",
      onlyLabs: "Only 4Cyte Pathology or Australian Clinical Labs. Any other laboratory will not accept your form and may bill you for the test.",
      cta: "Find a collection centre",
      formLine: "Your request form is attached to this email as a PDF.",
    },
    mobile: {
      title: "Your next step: we call you",
      body: "We'll call you on {phone} within {callWithin} to arrange a time for a qualified collector to come to {address}. Morning slots are best if you're fasting.",
      cta: "View your order",
      formLine: "Your request form is attached. Keep it handy, the collector will ask for it.",
      coverage: "If we can't reach your address, we'll refund the {visitFee} visit fee and you can use any collection centre instead.",
    },
    noForm: "Our team is preparing your pathology request form and will email it within one business day. You need it before your collection.",
  },
  prepare: {
    title: "Before your blood draw",
    items: [
      "Fast for 10 to 12 hours beforehand. Water is fine, and encouraged. No food, coffee, tea or juice.",
      "Take your usual medications unless your doctor has told you otherwise.",
      "Drink a glass of water an hour before. It makes the draw easier.",
      "Bring photo ID: driver licence, passport or similar. The collector checks it against your form.",
      "Wear a top with sleeves that roll up easily.",
    ],
  },
  onTheDay: {
    centre: {
      title: "At the collection centre",
      items: [
        "Hand over page 1 of your request form and your photo ID.",
        "The collector confirms your name and date of birth, takes one sample, and signs the form. About ten minutes.",
        "Your test is already paid for. If anyone asks you to pay or for a Medicare card for billing, show them the billing notice on page 1 or call us.",
      ],
    },
    mobile: {
      title: "On the day",
      items: [
        "Have your request form and photo ID ready.",
        "The collector confirms your name and date of birth, takes one sample, and signs the form. About ten minutes.",
        "Your test is already paid for. Nothing is owed on the day.",
      ],
    },
  },
  results: {
    title: "Your results",
    body: "Within 5 days of your collection, an Australian-registered doctor reviews your results and we email you a secure link to your report: every result explained in plain English. If anything needs prompt attention, we call you.",
  },
  offer: {
    title: "Automatic Retesting: {headline}",
    body: "Choose a retesting rhythm and we refund the plan discount on this order straight to your card. Available until {deadline}.",
    cta: "See the offer",
  },
  help: {
    title: "Need a hand?",
    body: "Reply to this email or call {supportPhone}, Monday to Friday. Your order reference is {reference}.",
  },
  footer: "Sent by {legalName}, trading as SIGNAL by Express Pathology. Pathology samples are analysed by accredited Australian laboratories. This email contains your pathology request form, which is confidential to you.",
};
