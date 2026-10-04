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
  { id: "book", title: "Get your request form", body: "It's emailed to you straight away. Take it to any participating collection centre, no appointment needed. If you chose a home or workplace visit, we call you to arrange a time.", timing: "Straight after payment", timingStatus: "verified" },
  { id: "collect", title: "Get collected", body: "Bring photo ID and your request form. A qualified collector takes one sample. A few minutes, then get on with your day.", timing: "At your chosen time", timingStatus: "verified" },
  { id: "results", title: "Results in your dashboard", body: "Reviewed before you see them, every marker explained in plain language.", timing: "Around 7 days after collection", timingStatus: "verified" },
  { id: "retest", title: "Retest and track", body: "Book a retest any time, or set up Automatic Retesting and watch what changes.", timing: "When you're ready", timingStatus: "verified" },
];

export const showTimingPlaceholders = () => process.env.VERCEL_ENV !== "production";
