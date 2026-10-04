import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

/** Checkout. Static shell; the client island renders the header (it changes on the payment step), reads ?addons=&collection= and quotes with the same pricing function as the configurator. */
export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container>
          <Checkout />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
