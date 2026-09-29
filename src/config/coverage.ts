/**
 * Collection coverage — PLACEHOLDER.
 *
 * TODO(integration): replace `checkPostcode()` with a call to the Express
 * booking platform (Doorstep) availability API. Until then this is a static
 * list used only to demonstrate the postcode checker. Nothing here is a
 * promise of service.
 *
 * Privacy: the postcode is used in the browser only. Analytics receive
 * `serviceable: true/false` and never the postcode (see events.ts).
 */
export interface CollectionCentre {
  id: string;
  name: string;
  suburb: string;
  postcode: string;
}

/** Postcodes where mobile (at-home) collection is available. TODO(placeholder). */
export const mobilePostcodes: readonly string[] = [
  // Sydney (sample)
  "2000", "2007", "2008", "2009", "2010", "2011", "2015", "2016", "2017", "2021", "2026", "2031", "2034",
  "2037", "2040", "2041", "2042", "2060", "2061", "2065", "2067", "2088", "2089", "2090", "2093", "2095",
  // Melbourne (sample)
  "3000", "3002", "3003", "3004", "3006", "3008", "3051", "3052", "3053", "3054", "3065", "3066", "3067",
  "3121", "3141", "3142", "3181", "3182", "3183", "3184", "3185", "3186",
  // Brisbane (sample)
  "4000", "4005", "4006", "4007", "4059", "4064", "4066", "4101", "4102", "4169", "4170", "4171",
  // Perth (sample)
  "6000", "6003", "6004", "6005", "6006", "6008", "6009", "6010", "6011", "6012", "6014", "6015", "6016",
  // Adelaide (sample)
  "5000", "5006", "5007", "5008", "5031", "5033", "5034", "5061", "5062", "5063", "5065", "5066", "5067",
];

/** Collection centres. TODO(placeholder): real centre list from the booking platform. */
export const collectionCentres: readonly CollectionCentre[] = [
  { id: "syd-cbd", name: "Sydney CBD", suburb: "Sydney", postcode: "2000" },
  { id: "syd-parramatta", name: "Parramatta", suburb: "Parramatta", postcode: "2150" },
  { id: "mel-cbd", name: "Melbourne CBD", suburb: "Melbourne", postcode: "3000" },
  { id: "mel-box-hill", name: "Box Hill", suburb: "Box Hill", postcode: "3128" },
  { id: "bne-cbd", name: "Brisbane City", suburb: "Brisbane", postcode: "4000" },
  { id: "per-cbd", name: "Perth CBD", suburb: "Perth", postcode: "6000" },
  { id: "adl-cbd", name: "Adelaide CBD", suburb: "Adelaide", postcode: "5000" },
];

export interface CoverageResult {
  /** True when the postcode is a valid 4-digit Australian postcode. */
  valid: boolean;
  /** Mobile (at-home) collection available. */
  mobile: boolean;
  /** Nearby collection centres (approximate: same first digit = same state). */
  centres: CollectionCentre[];
}

export const POSTCODE_PATTERN = /^\d{4}$/;

/** Pure, synchronous lookup against the placeholder lists. Swap for the API call later. */
export function checkPostcode(input: string): CoverageResult {
  const postcode = input.trim();
  if (!POSTCODE_PATTERN.test(postcode)) return { valid: false, mobile: false, centres: [] };
  const mobile = mobilePostcodes.includes(postcode);
  const state = postcode.charAt(0);
  const centres = collectionCentres.filter((c) => c.postcode.charAt(0) === state).slice(0, 3);
  return { valid: true, mobile, centres };
}
