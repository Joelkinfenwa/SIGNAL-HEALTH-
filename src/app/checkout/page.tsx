import { PlannedPage } from "@/components/layout/PlannedPage";
export const metadata = { title: "Checkout", robots: { index: false } };
/** Phase 6: order summary from ?addons=&collection=, Stripe boundary. */
export default function CheckoutPage() {
  return <PlannedPage title="Checkout" purpose="Order summary (SIGNAL Test + add-ons + collection), Stripe Payment Element + Apple Pay / Google Pay. Phase 6." />;
}
