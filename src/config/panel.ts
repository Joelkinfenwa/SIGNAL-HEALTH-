/**
 * The SIGNAL Test, grouped the way customers read it: seven areas, every
 * marker named. Shared by the funnel pages and checkout so the count and the
 * grouping never differ between the page that sells and the page that takes
 * payment. Marker ids come from config/biomarkers.ts; the sum must equal
 * products.ts (tests enforce it).
 */
export interface PanelArea { id: string; name: string; explanation: string; markerIds: string[] }

export const panelAreas: PanelArea[] = [
  { id: "energy", name: "Energy and iron", explanation: "Looks at the cells that carry oxygen and the iron that makes them, the most common place to start when energy is low.", markerIds: ["fbc", "ferritin", "iron", "transferrin", "tsat"] },
  { id: "heart", name: "Heart and cholesterol", explanation: "Looks at the fats in your blood and the particles that carry them.", markerIds: ["tc", "ldl", "hdl", "tg", "non_hdl"] },
  { id: "metabolism", name: "Metabolism and blood sugar", explanation: "Looks at where your blood sugar sits today and on average over the last three months.", markerIds: ["glucose", "hba1c"] },
  { id: "thyroid", name: "Thyroid", explanation: "Looks at the signal that controls the gland setting your metabolic pace.", markerIds: ["tsh"] },
  { id: "liver-kidneys", name: "Liver and kidneys", explanation: "Looks at how your liver is working and how well your kidneys are filtering.", markerIds: ["alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein", "creatinine", "egfr", "urea"] },
  { id: "electrolytes", name: "Electrolytes and minerals", explanation: "Looks at the salts and minerals your fluid balance, nerves, muscles and bones depend on.", markerIds: ["sodium", "potassium", "chloride", "bicarbonate", "calcium", "magnesium", "phosphate", "uric_acid"] },
  { id: "inflammation", name: "Inflammation", explanation: "Looks at your general level of inflammation right now, which adds context to the heart and metabolic results.", markerIds: ["hscrp"] },
];

/** What every SIGNAL Test includes, as said on the funnel and at checkout. All lines confirmed by the Director on 2 Oct 2026. */
export const included: { icon: "tube" | "shield" | "chat" | "calendar" | "check" | "home"; text: string }[] = [
  { icon: "tube", text: "One blood draw. Walk in to any 4Cyte or Clinical Labs centre, no appointment" },
  { icon: "shield", text: "Analysed by an accredited Australian laboratory" },
  { icon: "chat", text: "A doctor's written explanation of every result, in plain English" },
  { icon: "calendar", text: "Results in your inbox within 5 days" },
  { icon: "check", text: "No GP referral, no lock-in" },
];

export const guarantee = { title: "Clear explanation or your fee back.", body: "If the doctor's explanation isn't clear, email us within 7 days of your report and we refund the test fee in full." };
