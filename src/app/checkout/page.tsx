import type { Metadata } from "next";
import Link from "next/link";
import { Checkout } from "@/components/checkout/Checkout";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

/** Checkout. Static shell; the client island reads ?addons=&collection= and quotes with the same pricing function as the configurator. */
export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container>
          <header className={styles.header}>
            <p className={styles.crumbs}><Link href="/signal">The SIGNAL Test</Link><span aria-hidden="true"> / </span><span>Checkout</span></p>
            <h1 className={styles.title}>Almost there.</h1>
            <p className={styles.intro}>Check your SIGNAL, choose how you&apos;d like to be collected, and pay. About a minute.</p>
          </header>
          <Checkout />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
