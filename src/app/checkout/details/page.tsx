import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

/**
 * Checkout, steps two and three: the details the laboratory needs, then
 * payment. Its own colour so it is unmistakably the checkout stage. The
 * client island reads the configuration from the URL (set by step one).
 */
export default function CheckoutDetailsPage() {
  return (
    <div data-theme="checkout" className={styles.stage}>
      <main id="main" className={styles.main}>
        <Container>
          <Checkout />
        </Container>
      </main>
    </div>
  );
}
