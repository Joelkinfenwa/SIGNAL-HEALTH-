/**
 * Brand configuration.
 *
 * `endorsementLevel` controls how prominent "by Express Pathology" is across the
 * whole site. Changing it here is the only change needed if SIGNAL later becomes
 * the dominant consumer brand.
 */
export type EndorsementLevel = "prominent" | "subtle" | "hidden";

export const brand = {
  name: "SIGNAL",
  endorsement: "by Express Pathology",
  endorsementLevel: "prominent" as EndorsementLevel,
  /** Legal entity shown in the footer. TODO: confirm entity name and ABN before launch. */
  legalName: "Express Pathology",
  supportEmail: "support@example.com", // TODO: replace
} as const;

/**
 * Trust statements. Every public claim must be substantiated under Australian
 * Consumer Law before launch — `substantiated` must be set to true by whoever
 * signs off the claim. See README "Claims register".
 */
export interface TrustPoint {
  id: string;
  title: string;
  body: string;
  substantiated: boolean;
}

export const trustPoints: TrustPoint[] = [
  {
    id: "network",
    title: "Collected by Express Pathology",
    body: "Australia's largest mobile blood collection network, with qualified collectors across the country.",
    substantiated: false,
  },
  {
    id: "laboratory",
    title: "Accredited laboratory testing",
    body: "Samples are analysed by accredited Australian pathology laboratories.",
    substantiated: false,
  },
  {
    id: "pricing",
    title: "One clear price",
    body: "The price you see includes the test. Collection options are shown before you pay.",
    substantiated: false,
  },
];
