/**
 * What happens next: the customer journey after "Continue", in plain steps.
 * Used on /signal, /checkout and /order so nobody has to guess.
 *
 * Timing is a business fact: `timing` stays a clearly marked placeholder
 * until operations confirm it. Placeholders render only on previews.
 */
export interface JourneyStep {
  id: string;
  title: string;
  body: string;
  /** e.g. "Today", "Within 2 business days". Placeholder text must start with "[". */
  timing: string;
  timingStatus: "verified" | "placeholder";
}

export const journey: JourneyStep[] = [
  { id: "pay", title: "Choose and pay", body: "Pick your SIGNAL and any add-ons. Pay by card, Apple Pay or Google Pay. No account needed first.", timing: "Today", timingStatus: "verified" },
  { id: "book", title: "Book your collection", body: "Choose a collection centre or, where available, a home or workplace visit at a time that suits you.", timing: "[Right after payment]", timingStatus: "placeholder" },
  { id: "collect", title: "Get collected", body: "A qualified collector takes one sample. A few minutes, then get on with your day.", timing: "[Your chosen time]", timingStatus: "placeholder" },
  { id: "results", title: "Results in your dashboard", body: "Reviewed before you see them, every marker explained in plain language.", timing: "[X business days after collection]", timingStatus: "placeholder" },
  { id: "retest", title: "Retest and track", body: "Book a retest any time, or set up Automatic Retesting and watch what changes.", timing: "When you're ready", timingStatus: "verified" },
];

export const showTimingPlaceholders = () => process.env.VERCEL_ENV !== "production";
