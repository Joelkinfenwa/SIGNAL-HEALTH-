/**
 * Trust bar claims. Only `status: "verified"` claims render in production.
 * Placeholders render on previews with a visible "To confirm" tag so they can
 * never pass as facts. DO NOT INVENT numbers, accreditations or turnaround.
 */
export interface TrustClaim {
  id: string;
  icon: "shield" | "home" | "chat" | "calendar" | "check" | "tube" | "pin";
  text: string;
  status: "verified" | "placeholder";
  /** Who signed it off and when. Required to mark verified. */
  verifiedBy?: string;
}

export const trustClaims: TrustClaim[] = [
  { id: "lab", icon: "tube", text: "Analysed by accredited Australian pathology laboratories", status: "verified", verifiedBy: "Director, 2 Oct 2026" },
  { id: "review", icon: "shield", text: "Results reviewed by an Australian-registered doctor before you see them", status: "verified", verifiedBy: "Director, 2 Oct 2026" },
  { id: "collection", icon: "home", text: "Collected at a centre or at home, where available", status: "verified", verifiedBy: "Director, 2 Oct 2026" },
  { id: "turnaround", icon: "calendar", text: "Results in around 7 days", status: "verified", verifiedBy: "Director, 2 Oct 2026" },
  { id: "express", icon: "pin", text: "By Express Pathology", status: "verified", verifiedBy: "Brand fact" },
];

export const showPlaceholders = () => process.env.VERCEL_ENV !== "production";
export const visibleTrustClaims = () => trustClaims.filter((c) => c.status === "verified" || showPlaceholders());
