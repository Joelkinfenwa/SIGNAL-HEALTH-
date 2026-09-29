import { featuredProduct, getProductByTier, products, type Product, type ProductTier } from "./products";

/**
 * "Find my test" quiz.
 *
 * PRIVACY: answers never leave the browser. Analytics receive only
 * quiz_version and the recommended product id (see events.ts). Nothing in
 * this file may be sent to an ad platform.
 *
 * COMPLIANCE: questions ask about goals and preferences, never symptoms or
 * conditions. The result is a product recommendation, not health advice.
 *
 * Bump QUIZ_VERSION when questions or rules change so analytics stay comparable.
 */
export const QUIZ_VERSION = "v1";

export type Scores = Partial<Record<ProductTier, number>>;

export interface QuizOption {
  id: string;
  label: string;
  hint?: string;
  scores: Scores;
}

export interface QuizQuestion {
  id: string;
  /** Short label for the progress list. */
  label: string;
  question: string;
  help?: string;
  options: QuizOption[];
  /** Optional questions show a "Skip" action. */
  optional?: boolean;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "goal",
    label: "Goal",
    question: "What do you most want to understand?",
    options: [
      { id: "overall", label: "How my body is doing overall", hint: "A solid all-round check", scores: { core: 3, complete: 2 } },
      { id: "energy", label: "Energy, mood and sleep", hint: "Including hormones and thyroid", scores: { complete: 3, hormones: 2 } },
      { id: "hormones", label: "My hormones specifically", scores: { hormones: 3, complete: 1 } },
      { id: "performance", label: "Training, performance and recovery", scores: { performance: 3 } },
      { id: "longterm", label: "Long-term heart and metabolic health", scores: { longevity: 3, complete: 1 } },
    ],
  },
  {
    id: "depth",
    label: "Depth",
    question: "How deep do you want to go?",
    options: [
      { id: "essentials", label: "The essentials, done properly", scores: { core: 3 } },
      { id: "full", label: "The full picture", hint: "Hormones, thyroid, insulin and advanced heart markers", scores: { complete: 3 } },
      { id: "everything", label: "Everything, including advanced markers", scores: { complete: 1, longevity: 2, performance: 1, hormones: 1 } },
    ],
  },
  {
    id: "training",
    label: "Training",
    question: "How would you describe your training?",
    options: [
      { id: "light", label: "I keep active, nothing structured", scores: {} },
      { id: "regular", label: "A few sessions a week", scores: { complete: 1 } },
      { id: "serious", label: "Most days, with a plan", hint: "Running, cycling, lifting, endurance", scores: { performance: 3 } },
    ],
  },
  {
    id: "lastTest",
    label: "History",
    question: "When did you last have a comprehensive blood test?",
    options: [
      { id: "never", label: "Never, or I'm not sure", scores: { core: 1, complete: 1 } },
      { id: "old", label: "More than a year ago", scores: { complete: 1 } },
      { id: "recent", label: "Within the last year", hint: "Great, now you can track change", scores: { complete: 1, longevity: 1 } },
    ],
  },
  {
    id: "age",
    label: "Age",
    question: "How old are you?",
    options: [
      { id: "u30", label: "Under 30", scores: { core: 1 } },
      { id: "30s", label: "30 to 44", scores: { complete: 1 } },
      { id: "45", label: "45 or over", scores: { longevity: 2, complete: 1 } },
    ],
  },
  {
    id: "sex",
    label: "Hormone markers",
    question: "Which hormone markers should we consider?",
    help: "Our first Hormones panel is designed around male hormone markers. This only affects which test we suggest.",
    optional: true,
    options: [
      { id: "male", label: "Male hormone markers", scores: { hormones: 1 } },
      { id: "female", label: "Female hormone markers", scores: { complete: 1 } },
      { id: "skip", label: "Prefer not to say", scores: {} },
    ],
  },
  {
    id: "collection",
    label: "Collection",
    question: "How would you like your blood collected?",
    help: "Every test can be collected either way. You choose when you book.",
    options: [
      { id: "home", label: "At home or work", hint: "A collector comes to you, where available", scores: {} },
      { id: "centre", label: "At a collection centre", scores: {} },
      { id: "unsure", label: "Not sure yet", scores: {} },
    ],
  },
];

export type QuizAnswers = Partial<Record<string, string>>;

export interface Recommendation {
  primary: Product;
  alternative: Product;
  /** Why this one, in one line, for the result screen. */
  reason: string;
}

const TIE_ORDER: ProductTier[] = ["complete", "core", "longevity", "performance", "hormones"];

/** Pure, rule-based recommendation. No answers are stored or transmitted. */
export function recommend(answers: QuizAnswers): Recommendation {
  const totals: Record<ProductTier, number> = { core: 0, complete: 0, hormones: 0, performance: 0, longevity: 0 };
  for (const q of quizQuestions) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) continue;
    for (const [tier, n] of Object.entries(opt.scores) as [ProductTier, number][]) totals[tier] += n;
  }

  // Overrides that a points total can't express well.
  if (answers.goal === "hormones" && answers.sex === "female") {
    totals.hormones = 0; // first Hormones panel is male-oriented; Complete carries the hormone markers
    totals.complete += 3;
  }
  if (answers.goal === "performance" && answers.training === "serious") totals.performance += 2;

  const ranked = (Object.entries(totals) as [ProductTier, number][])
    .sort((a, b) => b[1] - a[1] || TIE_ORDER.indexOf(a[0]) - TIE_ORDER.indexOf(b[0]))
    .map(([tier]) => getProductByTier(tier)!);

  const primary = ranked[0] ?? featuredProduct();
  const alternative = ranked[1] ?? products.find((p) => p.id !== primary.id)!;
  return { primary, alternative, reason: reasonFor(primary.tier, answers) };
}

function reasonFor(tier: ProductTier, a: QuizAnswers): string {
  switch (tier) {
    case "core":
      return "You want a proper all-round baseline without going into advanced markers. Core covers the essentials well.";
    case "complete":
      return a.goal === "hormones" && a.sex === "female"
        ? "Complete includes the hormone markers alongside everything else, so you get the full context."
        : "You want the full picture. Complete adds hormones, thyroid, insulin and advanced heart markers to the Core baseline.";
    case "hormones":
      return "You asked about hormones specifically. This panel measures them alongside the markers that put them in context.";
    case "performance":
      return "You train seriously. Performance focuses on the markers that relate to energy, oxygen carrying, muscle load and recovery.";
    case "longevity":
      return "You're thinking long term. Longevity adds the advanced heart and metabolic markers that matter over decades.";
  }
}
