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
  {
    id: "collection",
    question: "How does the blood collection work?",
    status: "draft",
    answer:
      "After you choose a test, you pick how you'd like your blood collected. Where mobile collection is available, a qualified collector from Express Pathology comes to your home or workplace at a time you choose. Otherwise you can visit a collection centre. The collection itself takes a few minutes.",
  },
  {
    id: "where",
    question: "Where is at-home collection available?",
    status: "draft",
    answer:
      "Mobile collection is available in many metropolitan areas and is expanding. Enter your postcode above to see the options in your area. If a collector can't come to you yet, you can still use a collection centre.",
  },
  {
    id: "timing",
    question: "How long until I get my results?",
    status: "draft",
    // TODO-VERIFY: confirm turnaround with the laboratory before launch.
    answer:
      "Most results are ready within a few business days of collection. We'll email you as soon as they're in, and you can read them in plain language in your SIGNAL dashboard.",
  },
  {
    id: "retesting",
    question: "What is Automatic Retesting?",
    status: "draft",
    answer:
      "Automatic Retesting books your next test every {interval} so you can see how your numbers change over time. It's optional, and it's offered after your first purchase. It uses recurring billing: you're charged for each test at the retest interval, and you can change the date or cancel from your account at any time.",
  },
  {
    id: "privacy",
    question: "Is my information private?",
    status: "draft",
    answer:
      "Yes. Your results are held in a separate clinical system, not on this website. We never share your results, which test you chose, or your quiz answers with advertising platforms. Our privacy policy explains what we collect and why.",
  },
  {
    id: "who-collects",
    question: "Who collects my blood?",
    status: "draft",
    answer:
      "Qualified collectors from Express Pathology, the mobile blood collection service behind SIGNAL.",
  },
  {
    id: "included",
    question: "What's included in the price?",
    status: "draft",
    // TODO-VERIFY: confirm pricing and collection-fee model.
    answer:
      "The price you see includes the test and the laboratory analysis. Collection options and any related details are shown clearly before you pay.",
  },
  { id: "fasting", question: "Do I need to fast before my test?", status: "todo-clinical" },
  { id: "referral", question: "Do I need a referral from a doctor?", status: "todo-clinical" },
  { id: "age", question: "Is there a minimum age?", status: "todo-clinical" },
  { id: "doctor", question: "What happens if something in my results needs attention?", status: "todo-clinical" },
];

export const renderableFaqItems = () => faqItems.filter((f): f is FaqItem & { answer: string } => Boolean(f.answer));
