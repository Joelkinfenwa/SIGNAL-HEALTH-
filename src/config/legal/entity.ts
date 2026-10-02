/**
 * Who the customer contracts with. Fill every bracketed value before launch;
 * the legal pages show a preview-only banner while any remain.
 */
export const legalEntity = {
  tradingName: "SIGNAL by Express Pathology",
  legalName: "[Legal entity name, e.g. Express Pathology Pty Ltd]",
  abn: "[ABN]",
  address: "[Registered address]",
  supportEmail: "[support email]",
  privacyEmail: "[privacy officer email]",
  /** Governing law and courts. */
  jurisdiction: "[State or Territory]",
  lastUpdated: "2 October 2026",
};

export const legalPlaceholders = () => Object.entries(legalEntity).filter(([, v]) => /^\[.*\]$/.test(v)).map(([k]) => k);
