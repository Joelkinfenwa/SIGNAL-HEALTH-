import { PlannedPage } from "@/components/layout/PlannedPage";
import { products } from "@/config/products";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export const metadata = { title: "Checkout", robots: { index: false } };
export default function CheckoutPage() {
  return <PlannedPage title="Checkout" purpose="Collection method, details, clinical requirements, payment (Stripe Payment Element + Apple Pay / Google Pay). Phase 2." />;
}
