/**
 * What every SIGNAL test includes. Shown on product pages and the compare page.
 * TODO-VERIFY every line with operations, the laboratory partner and legal.
 */
export interface IncludedItem {
  id: string;
  icon: "tube" | "home" | "shield" | "chat" | "chart" | "refresh" | "calendar" | "check";
  title: string;
  body: string;
  verified: boolean;
}

export const everyTestIncludes: IncludedItem[] = [
  { id: "lab", icon: "tube", title: "Laboratory analysis", body: "Your sample is analysed by an accredited Australian pathology laboratory.", verified: false },
  { id: "collection", icon: "home", title: "Collection, your way", body: "A collector visits your home or workplace where available, or you drop into a collection centre.", verified: false },
  { id: "review", icon: "shield", title: "Clinical review", body: "Results are reviewed before you see them.", verified: false },
  { id: "explained", icon: "chat", title: "Every marker explained", body: "Plain-language explanations of what each marker measures and where yours sits.", verified: false },
  { id: "tracking", icon: "chart", title: "Change over time", body: "Retest and see how each marker has moved since last time.", verified: false },
  { id: "addons", icon: "check", title: "Add-ons when you want them", body: "Go deeper with focused bundles instead of paying for everything in every panel.", verified: false },
];
