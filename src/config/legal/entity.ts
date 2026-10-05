/**
 * Who the customer contracts with. Fill every bracketed value before launch;
 * the legal pages show a preview-only banner while any remain.
 */
export const legalEntity = {
  tradingName: "SIGNAL by Express Pathology",
  legalName: "Express Pathology Pty Ltd",
  abn: "87 681 058 319", // ABR lookup 4 Oct 2026; TODO-VERIFY against the company's own records
  address: "[Registered address]",
  supportEmail: "express@expresspathology.com.au",
  privacyEmail: "express@expresspathology.com.au",
  /** Governing law and courts. */
  jurisdiction: "New South Wales",
  lastUpdated: "4 October 2026",
};

export const legalPlaceholders = () => Object.entries(legalEntity).filter(([, v]) => /^\[.*\]$/.test(v)).map(([k]) => k);
