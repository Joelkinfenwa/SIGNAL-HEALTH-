/**
 * Homepage FAQ.
 *
 * `status`:
 *  - "draft": non-clinical answer, drafted, needs marketing/legal sign-off.
 *  - "todo-clinical": question is clinical or regulatory; NO answer is rendered
 *    until the clinical lead supplies one.
 *
 * Only items with an `answer` render on the page and in the FAQPage schema.
 * Tokens allowed in answers: {fromPrice} {areas} {markers} {interval}.
 */
export interface FaqItem {
  id: string;
  question: string;
  answer?: string;
  status: "draft" | "todo-clinical";
}

export const faqItems: FaqItem[] = [
  { id: "referral", question: "Do I need a GP referral?", status: "todo-clinical" },
  {
    id: "where",
    question: "Where can I get collected?",
    status: "draft",
    // TODO-VERIFY launch regions and centre list.
    answer: "At any participating collection centre, no appointment needed: bring your request form and photo ID. Only 4Cyte Pathology and Australian Clinical Labs centres accept the form; both centre finders are on our collection page. Home or workplace collection is available in selected areas and arranged by phone after payment.",
  },
  {
    id: "home",
    question: "Can someone come to my home?",
    status: "draft",
    answer: "In selected areas, yes: a qualified collector from Express Pathology comes to your home or workplace at a time you choose. We call you after payment to arrange it and refund the visit fee if we can't reach your address.",
  },
  { id: "timing", question: "How long do results take?", status: "todo-clinical" },
  { id: "review", question: "Who reviews my results?", status: "todo-clinical" },
  { id: "abnormal", question: "What happens if something is outside the expected range?", status: "todo-clinical" },
  { id: "gp", question: "Can I share results with my GP?", status: "todo-clinical" },
  {
    id: "retest",
    question: "Can I retest?",
    status: "draft",
    answer: "Yes. Retesting is how SIGNAL becomes most useful: each new result is compared with your last, marker by marker. You can book a one-off retest any time, or choose Automatic Retesting after your first test.",
  },
  {
    id: "cancel",
    question: "Can I cancel Automatic Retesting?",
    status: "draft",
    answer: "Yes, at any time by emailing us, with no fees. Automatic Retesting uses recurring billing: you're charged the discounted price for each test at the start of each interval, and it continues until you cancel. We email you before every charge.",
  },
  { id: "diagnostic", question: "Are these diagnostic tests?", status: "todo-clinical" },
  { id: "labs", question: "Which laboratories are used?", status: "todo-clinical" },
  {
    id: "privacy",
    question: "Is my information private?",
    status: "draft",
    answer: "Your results are held in a separate clinical system, not on this website. We never share your results, your add-on choices or your quiz answers with advertising platforms. Our privacy policy explains what we collect and why.",
  },
  {
    id: "included",
    question: "What's included in the price?",
    status: "draft",
    // TODO-VERIFY pricing and collection-fee model.
    answer: "The SIGNAL Test price covers the test and the laboratory analysis, review, and your explained results. Any add-ons and collection details are shown clearly before you pay.",
  },
];

export const renderableFaqItems = () => faqItems.filter((f): f is FaqItem & { answer: string } => Boolean(f.answer));
