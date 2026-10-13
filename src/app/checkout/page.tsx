import type { Metadata } from "next";
import { BuildStep } from "@/components/checkout/BuildStep";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Build your test", robots: { index: false, follow: false } };

/**
 * Checkout, step one: collection choice and add-ons. Static shell; the client
 * island reads ?product=&addons=&collection=&plan= and quotes with the same
 * pricing function as every other surface. Step two is /checkout/details.
 */
export default function CheckoutPage() {
  return (
    <>
      <CheckoutHeader backHref="/" backLabel="Back" />
      <main id="main" className={styles.main}>
        <Container>
          <BuildStep />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
