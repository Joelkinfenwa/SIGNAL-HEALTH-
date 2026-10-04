import { PREVIEW_PRICING } from "@/config/pricing";

/** Visible whenever placeholder prices are switched on, so nobody mistakes them for real ones. */
export function PreviewPricingBanner() {
  if (!PREVIEW_PRICING) return null;
  return (
    <p style={{ margin: 0, padding: "6px 16px", background: "#fce3da", color: "#121614", fontSize: "0.8125rem", fontWeight: 700, textAlign: "center" }}>
      Preview pricing: placeholder amounts for testing payments. Not real prices.
    </p>
  );
}
