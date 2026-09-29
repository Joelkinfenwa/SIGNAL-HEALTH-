import { PlannedPage } from "@/components/layout/PlannedPage";
export const metadata = { title: "Order confirmed", robots: { index: false } };
/**
 * Post-payment page. Access requires a signed, short-lived order token (phase 2);
 * the order id alone never grants access. Payment status is read from our
 * database (updated by the Stripe webhook), never from query parameters.
 */
export default function OrderPage() {
  return <PlannedPage title="Order confirmed" purpose="Order confirmation, then the Automatic Retesting offer, then booking next steps. Phase 2." />;
}
