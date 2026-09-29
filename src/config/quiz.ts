import { addonsFor, recommendAddons, type Addon } from "./addons";
import { interests, type InterestId } from "./interests";
import { signalTest, type Product } from "./products";

/**
 * "Find my SIGNAL" — product matching, not diagnosis.
 *
 * The result is always THE SIGNAL TEST plus recommended add-ons for the
 * interests chosen. Interests are preferences. They stay in the browser;
 * analytics receive only quiz_version, product id and add-on ids.
 *
 * Bump QUIZ_VERSION when questions or rules change.
 */
export const QUIZ_VERSION = "v2";

export interface QuizQuestion {
  id: string;
  label: string;
  question: string;
  help?: string;
  multi?: boolean;
  options: { id: string; label: string; hint?: string }[];
  optional?: boolean;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "interests",
    label: "Interests",
    question: "What would you most like to understand?",
    help: "Choose as many as you like.",
    multi: true,
    options: interests.map((i) => ({ id: i.id, label: i.label, hint: i.hint })),
  },
  {
    id: "training",
    label: "Training",
    question: "How would you describe your training?",
    options: [
      { id: "light", label: "I keep active, nothing structured" },
      { id: "regular", label: "A few sessions a week" },
      { id: "serious", label: "Most days, with a plan", hint: "Running, cycling, lifting, endurance" },
    ],
  },
  {
    id: "lastTest",
    label: "History",
    question: "When did you last have a comprehensive blood test?",
    options: [
      { id: "never", label: "Never, or I'm not sure" },
      { id: "old", label: "More than a year ago" },
      { id: "recent", label: "Within the last year", hint: "Great, now you can track change" },
    ],
  },
  {
    id: "collection",
    label: "Collection",
    question: "How would you like your blood collected?",
    help: "Every SIGNAL can be collected either way. You choose when you book.",
    options: [
      { id: "mobile", label: "At home or work", hint: "A collector comes to you, where available" },
      { id: "centre", label: "At a collection centre" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
];

/** Answers: single-select questions map to an option id; multi-select to an array. */
export type QuizAnswers = Partial<Record<string, string | string[]>>;

export interface Recommendation {
  product: Product;
  addons: Addon[];
  /** One line per recommended add-on explaining the match. */
  reasons: Record<string, string>;
  interestIds: InterestId[];
}

const REASON: Record<string, string> = {
  hormones_plus: "You want to understand your hormones. Hormones+ adds the signals behind them.",
  heart_plus: "Heart health matters to you. Heart+ adds the particle-level cholesterol markers.",
  thyroid_plus: "Thyroid is on your list. Thyroid+ adds the active hormones and antibodies beyond TSH.",
  performance_plus: "You train seriously. Performance+ adds muscle load, stress and recovery markers.",
  metabolic_plus: "Metabolic health matters to you. Metabolic+ adds fasting insulin and how your body responds to it.",
  nutrients_plus: "Nutrition is on your list. Nutrients+ adds micronutrients beyond the base panel.",
};

/** Pure, rule-based. No answers are stored or transmitted. */
export function recommend(answers: QuizAnswers): Recommendation {
  const raw = answers.interests;
  const interestIds = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter((i): i is InterestId => interests.some((x) => x.id === i));
  let addons = recommendAddons(interestIds, signalTest);
  if (answers.training === "serious" && !addons.some((a) => a.id === "performance_plus")) {
    const perf = addonsFor(signalTest).find((a) => a.id === "performance_plus");
    if (perf) addons = [...addons, perf];
  }
  // Keep the result focused: the base test is the product; at most three add-ons.
  addons = addons.slice(0, 3);
  const reasons: Record<string, string> = {};
  for (const a of addons) reasons[a.id] = REASON[a.id] ?? a.benefit;
  return { product: signalTest, addons, reasons, interestIds };
}
